import { createSelectorCreator } from 'reselect';
import shallowEquals from 'shallowequal';
import reactFastCompare from 'react-fast-compare';
import { getUniqId } from '../utils';

const getSelectorId = getUniqId('selector');

const selectorExceedMap = new Map();
let selectorId = 1;
const selectorMemory = {};
// 半个小时之后将cache 清空以免内存泄漏
// const CACHE_LIVING_MILLISECOND = 30 * 60 * 1000;
const CACHE_LIVING_MILLISECOND = 0;

const areArgumentsShallowlyEqual = (equalityCheck, prev, next) => {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  const { length } = prev;
  for (let i = 0; i < length; i += 1) {
    if (!equalityCheck(prev[i], next[i])) {
      return false;
    }
  }

  return true;
};

const customizedMemoize = (func, equalityCheck = ((a, b) => a === b), selectId = 'dependencies') => {
  let timeout = null;
  let lastArgs = null;
  let lastResult = null;
  // we reference arguments instead of spreading them for performance reasons
  const innerFunc = (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    if (CACHE_LIVING_MILLISECOND > 0) {
      timeout = setTimeout(() => {
        lastArgs = null;
        lastResult = null;
        timeout = null;
      }, CACHE_LIVING_MILLISECOND);
    }
    let tempResult = null;
    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, args)) {
      // apply arguments instead of spreading for performance.
      tempResult = func(...args);
      if (!equalityCheck(tempResult, lastResult)) {
        lastResult = tempResult;
      }
    }

    lastArgs = args;
    return lastResult;
  };

  if (process.env.NODE_ENV === 'development') {
    return (...args) => {
      const start = new Date().getTime();
      const result = innerFunc(...args);
      const cost = new Date().getTime() - start;
      if (cost > 20) {
        let { id, count } = selectorExceedMap.get(func) || {};
        if (!id) {
          id = selectorId;
          count = 0;
          selectorId += 1;
        }
        count += 1;
        selectorExceedMap.set(func, { id, count });
        // eslint-disable-next-line no-console
        console.log({
          log: `selector #${id} exceed ${count} times: ${cost}ms`,
          input: args,
          output: result,
        });
        if (selectorMemory[selectId]) {
          // eslint-disable-next-line no-console
          console.log(selectorMemory[selectId].resultFunc);
          // eslint-disable-next-line no-console
          console.log(selectorMemory[selectId].recomputations());
        }

        if (selectId === 'dependencies') {
          // eslint-disable-next-line no-console
          console.log(func);
        }
      }
      return result;
    };
  }

  return innerFunc;
};

// const customizedMemoize = (...outerArgs) => {
//   const func = outerArgs[0];
//   const equalityCheck = size(outerArgs) <= 1 ||
//       outerArgs[1] === undefined ? (a, b) => a === b : outerArgs[1];

//   let lastArgs = null;
//   let lastResult = null;

//   const innerFunc = (...innerArgs) => {
//     let tempResult = null;

//     if (lastArgs === null
//       || size(lastArgs) !== size(innerArgs)
//       || !innerArgs.every((value, index) => equalityCheck(value, lastArgs[index]))) {
//       tempResult = func(...innerArgs);

//       if (!equalityCheck(tempResult, lastResult)) {
//         lastResult = tempResult;
//       }
//     }

//     lastArgs = innerArgs;
//     return lastResult;
//   };

//   // eslint-disable-next-line no-undef
//   if (DEBUG) {
//     const selectId = outerArgs[2];
//     return (...args) => {
//       const start = new Date().getTime();
//       const result = innerFunc(...args);
//       const cost = new Date().getTime() - start;
//       if (cost > 20) {
//         let { id, count } = selectorExceedMap.get(func) || {};
//         if (!id) {
//           id = selectorId;
//           count = 0;
//           selectorId += 1;
//         }
//         count += 1;
//         selectorExceedMap.set(func, { id, count });
//         // eslint-disable-next-line no-console
//         console.log({
//           log: `selector #${id} exceed ${count} times: ${cost}ms`,
//           input: args,
//           output: result,
//         });
//         if (selectorMemory[selectId]) {
//           // eslint-disable-next-line no-console
//           console.log(selectorMemory[selectId].resultFunc);
//           // eslint-disable-next-line no-console
//           console.log(selectorMemory[selectId].recomputations());
//         }
//       }
//       return result;
//     };
//   }

//   return innerFunc;
// };

const createSelectorCreatorNoRecord = createSelectorCreator(customizedMemoize, shallowEquals);
export const deepEqualCreateSelector = createSelectorCreator(customizedMemoize, reactFastCompare);
export default (...funcs) => {
  if (process.env.NODE_ENV === 'development') {
    const selectId = getSelectorId();
    const createSelectorCreatorRecord = createSelectorCreator(customizedMemoize, shallowEquals, selectId);
    const selector = createSelectorCreatorRecord(...funcs);
    selectorMemory[selectId] = selector;
    return selector;
  }
  return createSelectorCreatorNoRecord(...funcs);
};
