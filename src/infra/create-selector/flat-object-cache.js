const isStringOrNumber = (value) => typeof value === 'string' || typeof value === 'number';

export default class FlatObjectCache {
  constructor() {
    this._cache = {};
  }

  set(key, selectorFn) {
    this._cache[key] = selectorFn;
  }

  get(key) {
    return this._cache[key];
  }

  remove(key) {
    delete this._cache[key];
  }

  clear() {
    this._cache = {};
  }

  // eslint-disable-next-line
  isValidCacheKey(cacheKey) {
    return isStringOrNumber(cacheKey);
  }
}
