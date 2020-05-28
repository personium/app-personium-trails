import React from 'react';
import { Header, Container, Button, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export function TopPage() {
  return (
    <Container>
      <Header as="h1">Hello Personium Trails</Header>
      <Segment>
        <Header as="h3">First, import location data!</Header>
        <div>You can disclose your data after importing data here.</div>
        <Button as={Link} to={'/import'}>
          Import data
        </Button>
      </Segment>
    </Container>
  );
}
