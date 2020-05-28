import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Item, Checkbox } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export function MoveItem(props) {
  const { __id, startTime: _startTime, endTime: _endTime } = props.dat;
  const startTime = parseInt(_startTime.match(/\/Date\((\d+)\)\//)[1]);
  const endTime = parseInt(_endTime.match(/\/Date\((\d+)\)\//)[1]);

  const [isPublic, setPublic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const onClick = useCallback(() => {
    console.log('clicked');
    if (loading) return;
    if (isPublic) {
      // clear ACL
      console.log('set to private');
      setPublic(false);
    } else {
      // set ACL
      console.log('set to public');
      setPublic(true);
    }
  }, [isPublic, loading]);

  const strPublic = isPublic ? 'public' : 'private';

  return (
    <Item>
      <Item.Content verticalAlign="middle">
        <Item.Header as={Link} to={`/detail/${__id}`}>
          MOVE
        </Item.Header>
        <Item.Meta>#{__id}</Item.Meta>
        <Item.Extra>
          <div>
            {new Date(startTime).toLocaleTimeString()} -{' '}
            {new Date(endTime).toLocaleTimeString()}
          </div>
          <Checkbox
            toggle
            disabled={loading}
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

MoveItem.propTypes = {
  dat: PropTypes.shape({
    __id: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    sLatitudeE7: PropTypes.number,
    sLongitudeE7: PropTypes.number,
    eLatitudeE7: PropTypes.number,
    eLongitudeE7: PropTypes.number,
  }),
};
