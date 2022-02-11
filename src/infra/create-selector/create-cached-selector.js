import createSelector from './create-selector';
import FlatObjectCache from './flat-object-cache';

const DefaultCacheCreator = FlatObjectCache;
const defaultCacheKeyValidator = () => true;

function createCachedSelector(...funcs) {
  return (polymorphicOptions, legacyOptions) => {
    if (legacyOptions) {
      throw new Error(
        '[re-reselect] "options" as second argument is not supported anymore. Please provide an option object as single argument.',
      );
    }
    const options = typeof polymorphicOptions === 'function'
      ? { keySelector: polymorphicOptions }
      : ({ ...polymorphicOptions });

    // https://github.com/reduxjs/reselect/blob/v4.0.0/src/index.js#L54
    let recomputations = 0;
    const resultFunc = funcs.pop();
    const dependencies = Array.isArray(funcs[0]) ? funcs[0] : [...funcs];

    const resultFuncWithRecomputations = (...args) => {
      recomputations += 1;
      return resultFunc(...args);
    };
    funcs.push(resultFuncWithRecomputations);

    const cache = options.cacheObject || new DefaultCacheCreator();
    const selectorCreator = options.selectorCreator || createSelector;
    const isValidCacheKey = cache.isValidCacheKey || defaultCacheKeyValidator;

    if (options.keySelectorCreator) {
      options.keySelector = options.keySelectorCreator({
        keySelector: options.keySelector,
        inputSelectors: dependencies,
        resultFunc,
      });
    }

    // Application receives this function
    const selector = (...args) => {
      const cacheKey = options.keySelector(...args);

      if (isValidCacheKey(cacheKey)) {
        let cacheResponse = cache.get(cacheKey);

        if (cacheResponse === undefined) {
          cacheResponse = selectorCreator(...funcs);
          cache.set(cacheKey, cacheResponse);
        }

        return cacheResponse(...args);
      }
      // eslint-disable-next-line
      if (process.ENV) {
        // eslint-disable-next-line
        console.warn(
          `[re-reselect] Invalid cache key "${cacheKey}" has been returned by keySelector function.`,
        );
      }
      return undefined;
    };

    // Further selector methods
    selector.getMatchingSelector = (...args) => {
      const cacheKey = options.keySelector(...args);
      // @NOTE It might update cache hit count in LRU-like caches
      return cache.get(cacheKey);
    };

    selector.removeMatchingSelector = (...args) => {
      const cacheKey = options.keySelector(...args);
      cache.remove(cacheKey);
    };

    selector.clearCache = () => {
      cache.clear();
    };

    selector.resultFunc = resultFunc;

    selector.dependencies = dependencies;

    selector.cache = cache;

    selector.recomputations = () => recomputations;

    selector.resetRecomputations = () => { recomputations = 0; };

    selector.keySelector = options.keySelector;

    return selector;
  };
}

export default createCachedSelector;
