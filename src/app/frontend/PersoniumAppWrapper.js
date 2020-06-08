import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { isLogin, isError, tokens } from './common/auth';
import { atomLocalMode } from './common/state';
import {
  authState,
  PersoniumLoginHandler,
  PersoniumLoginROPC,
} from './lib/personium_auth_adapter';
import { useHistory } from 'react-router-dom';
import { PersoniumLoading } from './parts/PersoniumLoading';

export function PersoniumAppWrapper(props) {
  const [login, setLogin] = useRecoilState(isLogin);
  const [error, setError] = useRecoilState(isError);
  const setLocalMode = useSetRecoilState(atomLocalMode);
  const setToken = useSetRecoilState(tokens);
  const history = useHistory();

  useEffect(() => {
    let unmounted = false;
    let autoRefreshID = -1;
    console.log('mounted PersoniumAppWrapper');

    const isLocalMode =
      location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    setLocalMode(isLocalMode);

    // Boot Script
    const LS_LAST_LOGIN_CELL = 'lastLoginCell';
    const appUrlSplit = `${location.origin}${location.pathname}`.split('/');
    const appCellUrl = `${appUrlSplit.slice(0, 3).join('/')}/`;

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

    if (!targetCell) {
      // targetCell unknown
      setError({ message: 'Launch this app from your Home App again.' });
      return () => {};
    }

    const handler = isLocalMode
      ? new PersoniumLoginROPC(
          targetCell,
          'app-personium-trails',
          localStorage.getItem('USERNAME_FOR_DEVELOPMENT'),
          localStorage.getItem('PASSWORD_FOR_DEVELOPMENT')
        )
      : new PersoniumLoginHandler(targetCell);

    // subscribe authentication state
    handler
      .loginAsync()
      .then(() => {
        // sined in successfully
        localStorage.setItem(LS_LAST_LOGIN_CELL, targetCell);
        console.log('logged in');
        if (!unmounted) {
          setLogin(true);
          setToken(authState.accessToken);
        }
        // start refreshing access_token (per 3000 sec)
        autoRefreshID = setInterval(() => handler.refreshAsync(), 3000 * 1000);
      })
      .catch(res => {
        // ToDo: change handling depending on situation.
        console.log(res);
        setError({
          message: 'Authentication failed',
          body: 'Please login from your Home App',
          bodyUrl: targetCell,
        });
      });

    return () => {
      // unsubscribe
      unmounted = true;
      if (autoRefreshID != -1) {
        clearInterval(autoRefreshID);
      }
    };
  }, []);

  if (login) return props.children;
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
      <PersoniumLoading />
      {error ? (
        <>
          <h1>{error.message || 'Oops, you cannot sign in'}</h1>
          <p>
            <a href={error.bodyUrl}>{error.body || 'click'}</a>
          </p>
        </>
      ) : null}
      <div style={{ flexGrow: 1 }} />
    </div>
  );
}

PersoniumAppWrapper.propTypes = {
  children: PropTypes.element.isRequired,
};
