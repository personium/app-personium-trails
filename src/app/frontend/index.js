import React from 'react';
import ReactDOM from 'react-dom';

import { Router } from 'react-router-dom';
import { createHashHistory } from 'history';
import { RecoilRoot } from 'recoil';

function createAppLoader() {
  const loadingFunc = import('./App');
  return () => loadingFunc;
}

const appLoader = createAppLoader();

const App = React.lazy(appLoader);
// import App from './App';

import { PersoniumAppWrapper } from './PersoniumAppWrapper';

const history = createHashHistory();
ReactDOM.render(
  <Router history={history}>
    <RecoilRoot>
      <PersoniumAppWrapper App={App} appLoader={appLoader} />
    </RecoilRoot>
  </Router>,
  document.getElementById('root')
);
