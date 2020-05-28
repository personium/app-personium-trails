import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';

export function TokenIntrospect({ introspection }) {
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
              <Table.Cell style={{ 'overflow-wrap': 'anywhere' }}>
                {val}
              </Table.Cell>
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
