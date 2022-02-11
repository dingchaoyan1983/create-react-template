import {
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { replace } from '@lagunovsky/redux-react-router';
import { curry, identity, contains } from '@/infra/lodash';
import {
  get, post, put, del,
} from '@/infra/api/request';
import {
  showLoading as showLoadingAction,
  hideLoading as hideLoadingAction,
} from './global-slice';
import { getActionType } from '../utils';

export * from '@reduxjs/toolkit';
export { getActionType } from '../utils';

const showLoading = (dispatch, needShowLoading) => {
  if (needShowLoading) {
    dispatch(showLoadingAction());
  }
};

const hideLoading = (dispatch, needShowLoading) => {
  if (needShowLoading) {
    global.setTimeout(() => {
      dispatch(hideLoadingAction());
    }, 0);
  }
};

// 设置页面登录后不跳转的路径列表
const pathFromBlackList = [
  '/login',
];

const httpAsyncActionCreator = (httpMethod = get) => (
  type,
  url,
  {
    payloadGetter = identity,
    isMocker = false,
    needAuth = true,
    showLoading: needShowLoading = true,
    isFormData,
    showServerError = true,
  } = {},
) => createAsyncThunk(
  getActionType(type, httpMethod.methodName, url),
  async (
    data,
    { dispatch, getState, rejectWithValue },
  ) => {
    // 显示加载中...
    showLoading(dispatch, needShowLoading);
    try {
      const response = await httpMethod(url, payloadGetter(data), { isMocker, needAuth, isFormData });
      // 隐藏加载中...
      hideLoading(dispatch, needShowLoading);
      return response;
    } catch (e) {
      const response = e?.response;
      const statusCode = response?.status;
      const error = response?.data;
      // 隐藏加载中...
      hideLoading(dispatch, needShowLoading);
      // 如果http的代码是401, 则退出系统致登陆界面
      if (statusCode === 401) {
        // 获取当前的系统路径
        const location = getState().router?.location;
        const currentPath = `${location?.pathname}${location?.search}`;
        const from = contains(currentPath)(pathFromBlackList) ? null : currentPath;
        dispatch(replace(`/login${from ? `?backUrl=${from}` : ''}`));
      }
      const errorMsg = error?.message;
      if (showServerError && errorMsg) {
        console.error(errorMsg);
      }
      return rejectWithValue(error);
    }
  },
);

export const httpGet = curry(httpAsyncActionCreator());
export const httpPost = curry(httpAsyncActionCreator(post));
export const httpPut = curry(httpAsyncActionCreator(put));
export const httpDelete = curry(httpAsyncActionCreator(del));
