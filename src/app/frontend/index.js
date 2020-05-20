import React from 'react';
import ReactDOM from 'react-dom';

import { Router } from 'react-router-dom';
import { createHashHistory } from 'history';
import { RecoilRoot } from 'recoil';

import App from './App';

import 'semantic-ui-css/semantic.min.css';

const history = createHashHistory();

ReactDOM.render(
  <Router history={history}>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </Router>,
  document.getElementById('root')
);
