import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  Suspense,
} from 'react';
import PropTypes from 'prop-types';
import {
  atom,
  useRecoilState,
  useRecoilValueLoadable,
  useRecoilValue,
} from 'recoil';

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
      <label>This location is set as `{aclStatus}`</label>
      <Input
        fluid
        disabled={aclStatus === 'private'}
        ref={refInput}
        value={locationUrl}
        action={{
          color: 'teal',
          icon: 'copy',
          labelPosition: 'right',
          content: 'Copy',
          onClick: onClick,
        }}
      />
    </Form.Field>
  );
}

LocationDataURLViewChild.propTypes = {
  __id: PropTypes.string,
  locationUrl: PropTypes.string,
};

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

LocationDataURLView.propTypes = {
  __id: PropTypes.string,
};

function LocationRawDataView({ __id }) {
  return (
    <Segment>
      <Header as="h4">Raw data</Header>
      <Suspense fallback={<div>Loading...</div>}>
        <LocationRawDataViewChild __id={__id} />
      </Suspense>
    </Segment>
  );
}

LocationRawDataView.propTypes = {
  __id: PropTypes.string,
};

function LocationRawDataViewChild({ __id }) {
  const locationUrl = useRecoilValue(locationURLFromId(__id));
  const [locationInfo, setLocationInfo] = useState({});

  useEffect(() => {
    let unmounted = false;
    fetch(locationUrl, {
      headers: {
        Authorization: `Bearer ${authState.accessToken.access_token}`,
      },
    })
      .then(res => res.json())
      .then(jsonDat => {
        if (!unmounted) setLocationInfo(jsonDat);
      });

    return function cleanup() {
      unmounted = true;
    };
  }, [locationUrl]);

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Value</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {Object.entries(locationInfo).map(([key, val]) => {
          const _val = typeof val === 'object' ? JSON.stringify(val) : val;
          return (
            <Table.Row key={key}>
              <Table.Cell>{key}</Table.Cell>
              <Table.Cell style={{ overflowWrap: 'anywhere' }}>
                {_val}
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

LocationRawDataViewChild.propTypes = {
  __id: PropTypes.string,
};

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

LocationODataView.propTypes = {
  __id: PropTypes.string,
};

export function DetailPage() {
  const { __id } = useParams();
  const [Id, setId] = useRecoilState(locationId);
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
      <LocationRawDataView __id={__id} />
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
