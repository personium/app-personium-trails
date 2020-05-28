import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';

export function TokenView({ token }) {
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

TokenView.propTypes = {
  token: PropTypes.shape({
    access_token: PropTypes.string,
    refresh_token_expires_in: PropTypes.number,
    refresh_token: PropTypes.string,
    p_target: PropTypes.string,
    scope: PropTypes.string,
    token_type: PropTypes.string,
    expires_in: PropTypes.number,
  }),
};
