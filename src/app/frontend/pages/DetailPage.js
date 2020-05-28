import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { atom, useRecoilState } from 'recoil';

import { useParams } from 'react-router-dom';
import { Container, Header, Message, Segment } from 'semantic-ui-react';

import { adapter } from '../adapters/locations';

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

export default function DetailPage() {
  const { __id } = useParams();
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
    adapter.getDetail(Id).then(result => {
      setLocationInfo(result);
    });
  }, [Id]);

  return (
    <Container>
      <Header as="h3">Detail of #{Id}</Header>
      <Segment>
        some information about the location
        {JSON.stringify(locationInfo)}
      </Segment>
      <input type="text" onChange={e => setText(e.target.value)} />
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
    }),
  }),
};
