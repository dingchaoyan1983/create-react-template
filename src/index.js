import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ReduxRouter } from '@lagunovsky/redux-react-router';
import LocaleProvider from '@/infra/intl';
import { browserHistory } from '@/infra/history';
import '@/infra/flexible';
import { store } from './app/store';
import Routes from './routes';
import * as serviceWorker from './serviceWorker';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <LocaleProvider>
      <Provider store={store}>
        <ReduxRouter
          history={browserHistory}
          store={store}
        >
          <Routes />
        </ReduxRouter>
      </Provider>
    </LocaleProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
