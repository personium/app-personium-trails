import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { atom, useRecoilState } from 'recoil';

import { useParams } from 'react-router-dom';
import { Container, Header, Message, Segment } from 'semantic-ui-react';

const locationId = atom({
  key: 'userLocationId',
  default: null,
});

export default function DetailPage() {
  const { __id } = useParams();
  const [Id, setId] = useRecoilState(locationId);

  useEffect(() => {
    setId(__id);
  }, [__id]);

  return (
    <Container>
      <Header as="h3">Detail of #{Id}</Header>
      <Segment>some information about the location</Segment>
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
