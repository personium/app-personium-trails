import React, { useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { atom, selector, useRecoilValue, useSetRecoilState } from 'recoil';

import { useParams } from 'react-router-dom';
import { Item, Container, Header } from 'semantic-ui-react';

import { adapter } from '../adapters/locations';
import StayItem from '../parts/StayItem';
import VisitItem from '../parts/VisitItem';

const locationQuery = atom({
  key: 'searchLocationQuery',
  default: {
    year: 2020,
    month: null,
    day: null,
  },
});

const locationResults = selector({
  key: 'searchLocationResult',
  get: async ({ get }) => {
    const query = get(locationQuery);
    if (query.year === null || query.month === null || query.day === null) {
      console.log('null');
      return await [];
    }

    const queryDate = new Date(query.year, query.month - 1, query.day);
    return await Promise.all([
      adapter.getStaysByDate(queryDate),
      adapter.getVisitsByDate(queryDate),
    ])
      .then(results => [].concat(...results))
      .then(results => results.sort((a, b) => a.startTime - b.startTime));
  },
});

export default function LocationComponent() {
  const setQuery = useSetRecoilState(locationQuery);
  const locations = useRecoilValue(locationResults);

  const { year, month, day } = useParams();

  useEffect(() => {
    setQuery({
      year: Number(year),
      month: Number(month),
      day: Number(day),
    });
  }, [year, month, day]);

  return (
    <Container>
      <Header as="h3">
        Locations on{' '}
        {new Date(
          Number(year),
          Number(month - 1),
          Number(day)
        ).toLocaleDateString()}
      </Header>
      <Suspense fallback={<h1>loading</h1>}>
        <Item.Group link>
          {(() => {
            console.log(locations);
            return locations.map(item => {
              if ('placeId' in item) {
                return <StayItem dat={item} key={`list-${item.__id}`} />;
              } else {
                return <VisitItem dat={item} key={`list-${item.__id}`} />;
              }
            });
          })()}
        </Item.Group>
      </Suspense>
    </Container>
  );
}

LocationComponent.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      year: PropTypes.string,
      month: PropTypes.string,
      day: PropTypes.string,
    }),
  }),
};
