import React from 'react';
import PropTypes from 'prop-types';
import { Item, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export default function VisitItem(props) {
  const { __id } = props.dat;
  return (
    <Item as={Link} to={`/detail/${__id}`}>
      <Item.Content verticalAlign="middle">
        <Item.Header>MOVE</Item.Header>
        <Item.Meta>#{__id}</Item.Meta>
        <Item.Extra>
          <Button floated="right">Action</Button>
        </Item.Extra>
      </Item.Content>
    </Item>
  );
}

VisitItem.propTypes = {
  dat: PropTypes.shape({
    __id: PropTypes.string,
    StartTime: PropTypes.number,
    endTime: PropTypes.number,
    sLatitudeE7: PropTypes.number,
    sLongitudeE7: PropTypes.number,
    eLatitudeE7: PropTypes.number,
    eLongitudeE7: PropTypes.number,
  }),
};
