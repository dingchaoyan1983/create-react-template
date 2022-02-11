import { flow, join, concat } from '@/infra/lodash';
import { DESIGN_WIDTH } from './constants';

let id = 0;

const docEl = document.documentElement;

export const _fontSize = (px) => (px / DESIGN_WIDTH) * docEl.clientWidth;

export const getUniqId = (prefix) => () => {
  id += 1;
  return `${prefix}_${id}`;
};

const getActionTypeUniqId = getUniqId('actionType');

export const getActionType = (filename, ...rest) => {
  if (process.env.NODE_ENV === 'development') {
    return `${filename}#${flow(concat(rest), join('#'))(getActionTypeUniqId())}`;
  }

  return getActionTypeUniqId();
};
