import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu, Container } from 'semantic-ui-react';

import { createHashHistory } from 'history';

import 'semantic-ui-css/semantic.min.css';

const history = createHashHistory();

const LocationComponent = ({ match }) => (
  <h1>Locations on {match.params.date}</h1>
);

LocationComponent.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      date: PropTypes.string,
    }),
  }),
};

ReactDOM.render(
  <Router history={history}>
    <Menu pointing fixed="top" inversed>
      <Container>
        <Menu.Item as={Link} to="/" name="Top" />
        <Menu.Item as={Link} to="/locations/2020-05-14" name="Locations" />
        <Menu.Item as={Link} to="/about" name="About" />
      </Container>
    </Menu>
    <Container style={{ marginTop: '7em' }}>
      <Route path="/" exact>
        <h1>Hello Personium Trails</h1>
      </Route>
      <Route path="/locations/:date" component={LocationComponent} />
      <Route path="/about" exact>
        <h1>About Personium Trails</h1>
      </Route>
    </Container>
  </Router>,
  document.getElementById('root')
);
