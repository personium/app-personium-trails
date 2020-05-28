import React, { useEffect, useState } from 'react';
import { isLogin, tokens } from '../common/auth';
import { atom, useRecoilValue, useRecoilState } from 'recoil';
import { Segment, Table } from 'semantic-ui-react';
import { handler } from '../lib/personium_auth_adapter';
import { TokenView } from '../parts/TokenView';
import { TokenIntrospect } from '../parts/TokenIntrospect';

const _introspection = atom({
  key: 'profileTokenIntrospection',
  default: null,
});

export function ProfilePage() {
  const login = useRecoilValue(isLogin);
  const token = useRecoilValue(tokens);
  const [introspection, setIntrospection] = useRecoilState(_introspection);
  const [userData, setUserData] = useState(null);

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

  return (
    <>
      <h1>Profile</h1>
      <Segment>
        <h3>Sample GET</h3>
        <p>Getting secret.txt</p>
        <p>{userData ? userData : 'loading'}</p>
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
