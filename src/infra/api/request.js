import axios from 'axios';
import store2 from 'store2';
import qs from 'qs';

const methods = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
};

const baseURL = '/api';
const mockerBaseURL = 'http://192.168.0.166:3068/mock/121';
const timeout = 30 * 1000;

// 如果是dev环境并且是使用的mocker才用mocker server的地址
const getBaseURL = (isMocker) => (isMocker && process.env.NODE_ENV === 'development' ? `${mockerBaseURL}${baseURL}` : baseURL);

const getParams = (method, data, isFormData) => {
  let innerData = data;

  if (method === methods.GET) {
    return { params: innerData };
  }

  if (isFormData) {
    innerData = qs.stringify(data);
  }

  return { data: innerData };
};

const getAuthHeader = (needAuth) => (needAuth ? { authorization: `Bearer ${store2.local.get('auth')}` } : {});

const getHeaders = (method, needAuth, isFormData) => {
  let headers = {};
  if (method !== method.GET && isFormData) {
    headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  return {
    ...headers,
    ...getAuthHeader(needAuth),
  };
};

const commonRequest = (method) => (url, data, {
  isMocker,
  needAuth = true,
  isFormData,
} = {}) => {
  const config = {
    method,
    url,
    baseURL: getBaseURL(isMocker),
    timeout,
    ...getParams(method, data, isFormData),
    headers: getHeaders(method, needAuth, isFormData),
  };
  return axios(config).then((response) => response?.data);
};

export const get = commonRequest(methods.GET);

export const post = commonRequest(methods.POST);

export const put = commonRequest(methods.PUT);

export const del = commonRequest(methods.DELETE);

get.methodName = methods.GET;
post.methodName = methods.POST;
put.methodName = methods.PUT;
del.methodName = methods.DELETE;
