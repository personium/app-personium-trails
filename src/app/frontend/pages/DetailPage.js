import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  atom,
  useRecoilState,
  useRecoilValueLoadable,
  useRecoilValue,
} from 'recoil';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

import { useParams } from 'react-router-dom';
import {
  Container,
  Header,
  Input,
  Segment,
  Table,
  Form,
} from 'semantic-ui-react';

import { authState } from '../lib/personium_auth_adapter';
import {
  locationACLStatusState,
  locationURLFromId,
  locationODataFromId,
  useLocationACLSubscribe,
} from '../common/location_stat';

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

function FaCopyIcon() {
  return (
    <FontAwesomeIcon icon={faCopy} className="icon" style={{ padding: 10 }} />
  );
}

function LocationDataURLViewChild({ __id, locationUrl }) {
  const { updateLocationACL } = useLocationACLSubscribe(__id, locationUrl);
  const aclStatus = useRecoilValue(locationACLStatusState(__id));
  const isLoading = aclStatus === 'loading';

  const refInput = useRef(null);

  useEffect(() => {
    updateLocationACL();
  }, []);

  const onClick = useCallback(() => {
    refInput.current.select();
    document.execCommand('copy');
  }, []);

  return (
    <Form.Field disabled={isLoading}>
      <label>Your public url</label>
      <Input
        disabled={aclStatus === 'private'}
        ref={refInput}
        value={locationUrl}
        action={{
          color: 'teal',
          icon: FaCopyIcon,
          labelPosition: 'right',
          content: 'Copy',
          onClick: onClick,
        }}
      />
    </Form.Field>
  );
}

function LocationDataURLView({ __id }) {
  const locationUrlLoadable = useRecoilValueLoadable(locationURLFromId(__id));

  const locationUrl =
    locationUrlLoadable.state === 'hasValue'
      ? locationUrlLoadable.contents
      : null;

  console.log({ locationUrl });

  const isLoading = locationUrlLoadable.state === 'loading';

  return (
    <Segment>
      <Header as="h4">Location URL</Header>
      <Form loading={isLoading}>
        {locationUrl ? (
          <LocationDataURLViewChild __id={__id} locationUrl={locationUrl} />
        ) : null}
      </Form>
    </Segment>
  );
}

function LocationODataView({ __id }) {
  const locationInfoLoadable = useRecoilValueLoadable(
    locationODataFromId(__id)
  );

  const isLoading = locationInfoLoadable.state === 'loading';
  const locationInfo =
    locationInfoLoadable.state === 'hasValue'
      ? locationInfoLoadable.contents
      : null;
  return (
    <Segment>
      <Header as="h4">some information about the location</Header>
      {isLoading ? (
        <div>Loading...</div>
      ) : locationInfo === null ? null : (
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
                  <Table.Cell style={{ overflowWrap: 'anywhere' }}>
                    {val}
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}
    </Segment>
  );
}

export function DetailPage() {
  const { __id, type } = useParams();
  const [Id, setId] = useRecoilState(locationId);

  const [text, setText] = useRecoilState(detailText);
  console.log(__id);

  useEffect(() => {
    console.log({ __id });
    setId(__id);
  }, [__id]);

  return (
    <Container>
      <Header as="h3">Detail of #{Id}</Header>
      <LocationDataURLView __id={__id} />
      <LocationODataView __id={__id} />
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
