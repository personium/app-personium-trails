import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRecoilState } from 'recoil';
import { isLogin, isError, tokens } from './common/auth';
import { handler } from './lib/personium_auth_adapter';
import { useHistory } from 'react-router-dom';

export function PersoniumAppWrapper(props) {
  const [login, setLogin] = useRecoilState(isLogin);
  const [error, setError] = useRecoilState(isError);
  const [token, setToken] = useRecoilState(tokens);
  const history = useHistory();

  useEffect(() => {
    let unmounted = false;
    let autoRefreshID = -1;
    console.log('mounted PersoniumAppWrapper');

    // Boot Script
    const LS_LAST_LOGIN_CELL = 'lastLoginCell';
    const appUrlSplit = `${location.origin}${location.pathname}`.split('/');
    const appCellUrl = `${appUrlSplit.slice(0, 3).join('/')}/`;

    const currentHash = location.hash.replace(/^#\/?/g, '#');
    console.log({ currentHash });

    let nextPath = '/';
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
      } else {
        throw `Something is wrong. Is hash wrong? ${currentHash}`;
      }
    } else {
      // boot directly
      nextPath = currentHash;
      const lastLoginCell = localStorage.getItem(LS_LAST_LOGIN_CELL);
      targetCell = lastLoginCell ? lastLoginCell : null;
    }

    history.push(nextPath);

    // subscribe authentication state
    // handler.subscribe();
    handler.loginAsync().then(() => {
      console.log('logged in');
      if (!unmounted) {
        setLogin(true);
        setToken({
          access_token: 'hogehoge',
        });
      }

      autoRefreshID = setInterval(() => handler.refreshAsync(), 1000);
    });

    return () => {
      // unsubscribe
      unmounted = true;
      if (autoRefreshID != -1) {
        clearInterval(autoRefreshID);
      }
    };
  }, []);
  return (
    <>
      {error ? (
        <h1>Oops, you cannot sign in</h1>
      ) : login ? (
        props.children
      ) : (
        <h1>start login...</h1>
      )}
    </>
  );
}

PersoniumAppWrapper.propTypes = {
  children: PropTypes.element.isRequired,
};
