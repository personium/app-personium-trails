import React, { useEffect, useState } from 'react';
import { isLogin, tokens } from '../common/auth';
import { atom, useRecoilValue, useRecoilState } from 'recoil';
import { Segment, Table } from 'semantic-ui-react';
import { authState as handler } from '../lib/personium_auth_adapter';
import { TokenView } from '../parts/TokenView';
import { TokenIntrospect } from '../parts/TokenIntrospect';
import { statDirectory } from '../adapters/webdav';

import xpath from 'xpath';
import { DOMParser } from 'xmldom';

const _introspection = atom({
  key: 'profileTokenIntrospection',
  default: null,
});

export function ProfilePage() {
  const login = useRecoilValue(isLogin);
  const token = useRecoilValue(tokens);
  const [introspection, setIntrospection] = useRecoilState(_introspection);
  const [userData, setUserData] = useState(null);
  const [xmlData, setXMLData] = useState(null);

  useEffect(() => {
    fetch(`${handler.boxUrl}secret.txt`, {
      headers: {
        Authorization: `Bearer ${handler.accessToken.access_token}`,
      },
    })
      .then(res => res.text())
      .then(text => setUserData(text));
    return () => setUserData(null);
  }, [token]);

  useEffect(() => {
    const { access_token } = handler.accessToken;
    statDirectory(`${handler.boxUrl}imported/`, access_token).then(res => {
      console.log(res);

      setXMLData(
        Array.from(res.entries()).map(([key, val]) => ({
          file: key,
          acl: Array.from(val.entries()).map(([key, val]) => ({
            principal: key,
            privilege: Array.from(val.keys()),
          })),
        }))
      );
    });
  }, handler.accessToken);

  return (
    <>
      <h1>Profile</h1>
      <Segment>
        <h3>Sample GET</h3>
        <p>Getting secret.txt</p>
        <p>{userData ? userData : 'loading'}</p>
      </Segment>

      <Segment>
        <h3>Sample XML</h3>
        <p>Getting /imported</p>
        <p>{xmlData ? JSON.stringify(xmlData) : 'loading'}</p>
      </Segment>

      <Segment>
        <h3>Tokens</h3>
        {login === true ? (
          <TokenView token={token} />
        ) : (
          <p>youre not logged in</p>
        )}
      </Segment>
      <Segment>
        <h3>Token introspection</h3>
        {introspection === null ? (
          <p>loading</p>
        ) : (
          <TokenIntrospect introspection={introspection} />
        )}
      </Segment>
    </>
  );
}
