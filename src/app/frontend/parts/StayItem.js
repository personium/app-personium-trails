import React from 'react';
import PropTypes from 'prop-types';
import { Item, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export default function StayItem(props) {
  const { __id, name } = props.dat;
  return (
    <Item as={Link} to={`/detail/${__id}`}>
      <Item.Content verticalAlign="middle">
        <Item.Header>{name}</Item.Header>
        <Item.Meta>#{__id}</Item.Meta>
        <Item.Extra>
          <Button floated="right">Action</Button>
        </Item.Extra>
      </Item.Content>
    </Item>
  );
}

StayItem.propTypes = {
  dat: PropTypes.shape({
    __id: PropTypes.string,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    latitudeE7: PropTypes.number,
    longitudeE7: PropTypes.number,
    name: PropTypes.string,
    placeId: PropTypes.string,
  }),
};
