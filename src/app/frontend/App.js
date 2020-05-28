import React, { Suspense, useState, useCallback } from 'react';
import { Route, Link } from 'react-router-dom';

import { TopPage } from './pages/TopPage';
import { LocationPage } from './pages/LocationPage';
import { DetailPage } from './pages/DetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { ImportPage } from './pages/ImportPage';

import {
  Menu,
  Container,
  Responsive,
  Sidebar,
  Segment,
  Icon,
} from 'semantic-ui-react';

export default function App() {
  const [sidebarOpened, setSidebarOpended] = useState(false);

  const handleSidebarHide = useCallback(() => {
    setSidebarOpended(false);
  });

  const handleToggle = useCallback(() => {
    setSidebarOpended(c => !c);
  });

  return (
    <>
      <Sidebar.Pushable as={Segment} style={{ height: '100vh' }}>
        <Sidebar
          as={Menu}
          animation="push"
          inverted
          onHide={handleSidebarHide}
          vertical
          visible={sidebarOpened}
        >
          <Menu.Item as={Link} to="/" name="Top" onClick={handleSidebarHide} />
          <Menu.Item
            as={Link}
            to="/locations/2020-04-01"
            name="Locations"
            onClick={handleSidebarHide}
          />
          <Menu.Item
            as={Link}
            to="/import"
            name="Import"
            onClick={handleSidebarHide}
          />
        </Sidebar>
        <Sidebar.Pusher dimmed={sidebarOpened}>
          <Segment
            inverted
            textAlign="center"
            style={{ minHeight: 30, padding: '0.5em 0em', marginBottom: 8 }}
            vertical
          >
            <Menu inverted pointing secondary size="large">
              <Container>
                <Menu.Item onClick={handleToggle}>
                  <Icon name="sidebar" />
                </Menu.Item>
              </Container>
            </Menu>
          </Segment>
          <Container>
            <Route path="/" exact>
              <TopPage />
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
            <Route path="/import" exact>
              <ImportPage />
            </Route>
          </Container>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </>
  );
}
