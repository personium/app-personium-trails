import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import { isLogin, tokens, $authInfo, $barInstalled } from './common/auth';
import { $localMode } from './common/state';
import {
  PersoniumLoginHandler,
  PersoniumLoginROPC,
} from './lib/personium_auth_adapter';
import { useHistory } from 'react-router-dom';
import { PersoniumLoading } from './parts/PersoniumLoading';
import { PersoniumBarInstaller } from './PersoniumBarInstaller';

const LS_LAST_LOGIN_CELL = 'lastLoginCell';

function PersoniumCellURL() {
  const setAuthInfo = useSetRecoilState($authInfo);
  const [cellUrlInput, setCellUrlInput] = useState('https://');

  const handleInput = useCallback(
    e => {
      setCellUrlInput(e.target.value);
    },
    [setCellUrlInput]
  );

  const handleSubmit = e => {
    e.preventDefault();
    // ToDo: validation
    setAuthInfo({ cellUrl: cellUrlInput });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="https://user.appdev.personium.io/"
          onChange={handleInput}
        />
        <button onSubmit={handleSubmit}>Submit</button>
      </form>
    </div>
  );
}

function PersoniumAuthentication() {
  const isLocalMode = useRecoilValue($localMode);
  const authInfo = useRecoilValue($authInfo);
  const setLogin = useSetRecoilState(isLogin);
  const setToken = useSetRecoilState(tokens);
  const setBarInstalled = useSetRecoilState($barInstalled);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unmounted = false;
    let autoRefreshID = -1;

    const appUrlSplit = `${location.origin}${location.pathname}`.split('/');
    const appCellUrl = isLocalMode
      ? 'https://app-personium-trails.appdev.personium.io/'
      : `${appUrlSplit.slice(0, 3).join('/')}/`;
    // const appCellUrl = 'https://app-personium-trails.appdev.personium.io/';
    const targetCell = authInfo.cellUrl;

    const handler = isLocalMode
      ? new PersoniumLoginROPC(
          targetCell,
          localStorage.getItem('USERNAME_FOR_DEVELOPMENT'),
          localStorage.getItem('PASSWORD_FOR_DEVELOPMENT'),
          'https://app-personium-trails.appdev.personium.io/'
        )
      : new PersoniumLoginHandler(targetCell);

    // subscribe authentication state
    localStorage.setItem(LS_LAST_LOGIN_CELL, targetCell);
    console.log(appCellUrl, authInfo);
    handler
      .loginAsync(appCellUrl, authInfo)
      .catch(res => {
        // ToDo: change handling depending on situation.
        console.log(JSON.stringify(res));
        localStorage.removeItem(LS_LAST_LOGIN_CELL);
        if (res.status === 404) {
          setError({
            message: 'Authentication failed',
            body: `Cell not found: ${targetCell}`,
            // ToDo: refactoring
            bodyUrl: 'javascript: location.reload();',
          });
        } else {
          setError({
            message: 'Authentication failed',
            body: 'Please login from your Home App',
            bodyUrl: targetCell,
          });
        }
        return Promise.reject(res);
      })
      .then(authState => {
        // sined in successfully
        console.log('logged in');
        if (!unmounted) {
          setToken(authState.accessToken);
        }
        // start refreshing access_token (per 3000 sec)
        autoRefreshID = setInterval(() => handler.refreshAsync(), 3000 * 1000);

        // check bar installed;
        return authState
          .updateBoxUrl() // ToDo: refactoring Promise chain
          .then(() => {
            setBarInstalled(true);
          })
          .catch(res => {
            if (res.status === 403) {
              console.log('bar not installed');
              setBarInstalled(false);
            }
          });
      })
      .then(res => {
        if (!unmounted) {
          setLogin(true);
        }
      })
      .catch(reason => {
        console.log('error happened', reason);
      });

    return () => {
      // unsubscribe
      unmounted = true;
      if (autoRefreshID != -1) {
        clearInterval(autoRefreshID);
      }
    };
  }, [authInfo, isLocalMode, setToken, setLogin, setError, setBarInstalled]);

  return error ? (
    <>
      <h1>{error.message || 'Oops, you cannot sign in'}</h1>
      <p>
        <a href={error.bodyUrl}>{error.body || 'click'}</a>
      </p>
    </>
  ) : null;
}

export function PersoniumAppWrapper(props) {
  const login = useRecoilValue(isLogin);
  const barInstalled = useRecoilValue($barInstalled);
  const [authInfo, setAuthInfo] = useRecoilState($authInfo);
  const setLocalMode = useSetRecoilState($localMode);
  const history = useHistory();

  useEffect(() => {
    console.log('mounted PersoniumAppWrapper');

    // ToDo: Set initialState in RecoilRoot
    const isLocalMode =
      //  false;
      location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    setLocalMode(isLocalMode);

    // Boot Script
    const currentHash = location.hash.replace(/^#\/?/g, '#');
    console.log({ currentHash });

    let targetCell = null;

    if (currentHash.startsWith('#cell')) {
      // boot from Home App
      const [target] = currentHash
        .replace(/^#\/?/g, '')
        .split('&')
        .map(kv => kv.split('='))
        .filter(([k]) => k === 'cell');

      if (target) {
        targetCell = target[1];
        history.push('/');
      } else {
        throw `Something is wrong. Is hash wrong? ${currentHash}`;
      }
    } else {
      // boot directly
      // nextPath = currentHash;
      const lastLoginCell = localStorage.getItem(LS_LAST_LOGIN_CELL);
      targetCell = lastLoginCell ? lastLoginCell : null;
    }

    // oauth redirected
    const url = new URL(location.href);
    if (
      url.searchParams.has('cellUrl') &&
      url.searchParams.has('code') &&
      url.searchParams.has('state')
    ) {
      setAuthInfo({
        cellUrl: url.searchParams.get('cellUrl'),
        code: url.searchParams.get('code'),
        state: url.searchParams.get('state'),
      });
      url.searchParams.delete('cellUrl');
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      window.history.replaceState({}, document.title, url.toString());
    } else {
      setAuthInfo(targetCell !== null ? { cellUrl: targetCell } : null);
    }

    // if (!targetCell) {
    //   // targetCell unknown
    //   setError({ message: 'Launch this app from your Home App again.' });
    //   return () => {};
    // }
  }, []);

  if (login && barInstalled === true) return props.children;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
      }}
    >
      <div style={{ flexGrow: 1 }} />
      {(() => {
        if (authInfo === null) return <PersoniumCellURL />;

        // attempt to login
        return (
          <>
            <PersoniumLoading />
            {(() => {
              if (!login) return <PersoniumAuthentication />;
              if (!barInstalled) return <PersoniumBarInstaller />;
            })()}
          </>
        );
      })()}
      <div style={{ flexGrow: 1 }} />
    </div>
  );
}

PersoniumAppWrapper.propTypes = {
  children: PropTypes.element.isRequired,
};
