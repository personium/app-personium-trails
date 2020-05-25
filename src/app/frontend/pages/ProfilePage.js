import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { isLogin, tokens } from '../common/auth';
import { atom, useRecoilValue, useRecoilState } from 'recoil';
import { Segment, Table } from 'semantic-ui-react';

function TokenView({ token }) {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Value</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {Object.entries(token).map(([key, val]) => {
          return (
            <Table.Row key={key}>
              <Table.Cell>{key}</Table.Cell>
              <Table.Cell>{val}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

TokenView.propTypes = {
  token: PropTypes.shape(),
};

function TokenIntrospect({ introspection }) {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Value</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {Object.entries(introspection).map(([key, val]) => {
          return (
            <Table.Row key={key}>
              <Table.Cell>{key}</Table.Cell>
              <Table.Cell>{val}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

TokenIntrospect.propTypes = {
  introspection: {
    active: PropTypes.bool,
    client_id: PropTypes.string,
    exp: PropTypes.number,
    iat: PropTypes.number,
    sub: PropTypes.string,
    aud: PropTypes.string,
    iss: PropTypes.string,
    p_roles: PropTypes.arrayOf(PropTypes.string),
  },
};

const _introspection = atom({
  key: 'profileTokenIntrospection',
  default: null,
});

export function ProfilePage() {
  const login = useRecoilValue(isLogin);
  const token = useRecoilValue(tokens);
  const [introspection, setIntrospection] = useRecoilState(_introspection);

  useEffect(() => {}, [token]);
  console.log({ introspection });
  console.log({ introspection: introspection !== null });

  return (
    <>
      <h1>Profile</h1>
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
          // <TokenIntrospect introspection={introspection} />
          console.log('hofe')
        )}
      </Segment>
    </>
  );
}
