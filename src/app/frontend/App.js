import React, { Suspense } from 'react';
import { Route, Link } from 'react-router-dom';

import LocationPage from './pages/LocationPage';
import DetailPage from './pages/DetailPage';
import { ProfilePage } from './pages/ProfilePage';

import { Menu, Container } from 'semantic-ui-react';

export default function App() {
  return (
    <>
      <Menu pointing>
        <Container>
          <Menu.Item as={Link} to="/" name="Top" />
          <Menu.Item as={Link} to="/locations/2017-03-02" name="Locations" />
          <Menu.Item as={Link} to="/about" name="About" />
          <Menu.Item as={Link} to="/profile" name="Profile" />
        </Container>
      </Menu>
      <Container>
        <Route path="/" exact>
          <h1>Hello Personium Trails</h1>
        </Route>
        <Route path="/locations/:year(\d+)-:month(\d+)-:day(\d+)">
          <Suspense fallback={<h1>loading</h1>}>
            <LocationPage />
          </Suspense>
        </Route>
        <Route path="/detail/:__id" component={DetailPage} />
        <Route path="/about" exact>
          <h1>About Personium Trails</h1>
        </Route>
        <Route path="/profile" exact>
          <ProfilePage />
        </Route>
      </Container>
    </>
  );
}
