import { configureStore } from '@reduxjs/toolkit';
import { createRouterMiddleware, createRouterReducer } from '@lagunovsky/redux-react-router';
import logger from 'redux-logger';
import globalReduer from '@/infra/redux-toolkit/global-slice';
import { browserHistory } from '@/infra/history';

const routerMiddleware = createRouterMiddleware(browserHistory);

export default (reducers = {}) => configureStore({
  middleware: (getDefaultMiddleware) => {
    const defaults = getDefaultMiddleware();
    defaults.push(routerMiddleware);
    if (process.env.NODE_ENV === 'development') {
      defaults.push(logger);
    }

    return defaults;
  },
  reducer: {
    global: globalReduer,
    router: createRouterReducer(browserHistory),
    ...reducers,
  },
});
