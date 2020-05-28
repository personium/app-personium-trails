import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { atom, useRecoilState } from 'recoil';

import { useParams } from 'react-router-dom';
import { Container, Header, Message, Segment, Table } from 'semantic-ui-react';

import { adapter } from '../adapters/locations_direct';

const locationId = atom({
  key: 'userLocationId',
  default: null,
});

const detailText = atom({
  key: 'detailText',
  default: '',
});

const _locationInfo = atom({
  key: 'locationInfo',
  default: null,
});

export function DetailPage() {
  const { __id, type } = useParams();
  const [locationInfo, setLocationInfo] = useRecoilState(_locationInfo);
  const [Id, setId] = useRecoilState(locationId);

  const [text, setText] = useRecoilState(detailText);

  useEffect(() => {
    console.log({ __id });
    setId(__id);
  }, [__id]);

  useEffect(() => {
    return () => {
      console.log('useEffect#cleanUp');
    };
  }, [text]);

  useEffect(() => {
    console.log({ Id });
    if (Id === null) return;
    adapter
      .getMoveDetail(Id)
      .catch(res => adapter.getStayDetail(Id))
      .catch(res => console.log('fetch error', res))
      .then(result => {
        setLocationInfo(result);
      });
  }, [Id]);

  return (
    <Container>
      <Header as="h3">Detail of #{Id}</Header>
      <Segment>
        <Header as="h4">some information about the location</Header>
        {locationInfo === null ? null : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Value</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {Object.entries(locationInfo).map(([key, val]) => {
                if (typeof val === 'object') return null;
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
        )}
      </Segment>
      <Message>
        <Message.Header>
          There may have been contact with the infected person.(example)
        </Message.Header>
        <Message.List>
          <Message.Item>Checklist of COVID19 subjective symptoms</Message.Item>
          <Message.Item>Guidance of PCR test</Message.Item>
          <Message.Item>Consultation counter</Message.Item>
        </Message.List>
      </Message>
    </Container>
  );
}

DetailPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      __id: PropTypes.string,
      type: PropTypes.string,
    }),
  }),
};
