import React from 'react';
import PropTypes from 'prop-types';
import { Item, Checkbox } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export function StayItem(props) {
  const { __id, name, startTime: _startTime, endTime: _endTime } = props.dat;
  const startTime = parseInt(_startTime.match(/\/Date\((\d+)\)\//)[1]);
  const endTime = parseInt(_endTime.match(/\/Date\((\d+)\)\//)[1]);

  const { isPublic, isLoading, onClick } = props;
  const strPublic = isPublic ? 'public' : 'private';

  return (
    <Item>
      <Item.Content verticalAlign="middle">
        <Item.Header as={Link} to={`/detail/${__id}`}>
          {name}
        </Item.Header>
        <Item.Meta>#{__id}</Item.Meta>
        <Item.Extra>
          <div>
            {new Date(startTime).toLocaleTimeString()} -{' '}
            {new Date(endTime).toLocaleTimeString()}
          </div>
          <Checkbox
            toggle
            disabled={isLoading}
            readOnly
            onClick={onClick}
            label={strPublic}
            checked={isPublic}
          />
        </Item.Extra>
      </Item.Content>
    </Item>
  );
}

StayItem.propTypes = {
  dat: PropTypes.shape({
    __id: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    latitudeE7: PropTypes.number,
    longitudeE7: PropTypes.number,
    name: PropTypes.string,
    placeId: PropTypes.string,
  }),
  isPublic: PropTypes.bool,
  isLoading: PropTypes.bool,
  onClick: PropTypes.func,
};
