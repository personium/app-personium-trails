import React from 'react';
import ReactDOM from 'react-dom';

import { Router } from 'react-router-dom';
import { createHashHistory } from 'history';
import { RecoilRoot } from 'recoil';

import App from './App';

import 'semantic-ui-css/semantic.min.css';

import { PersoniumAppWrapper } from './PersoniumAppWrapper';

const history = createHashHistory();

ReactDOM.render(
  <Router history={history}>
    <RecoilRoot>
      <PersoniumAppWrapper>
        <App />
      </PersoniumAppWrapper>
    </RecoilRoot>
  </Router>,
  document.getElementById('root')
);
