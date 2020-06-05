import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import { addDays } from 'date-fns';

import {
  Button,
  Modal,
  Card,
  Container,
  Grid,
  Divider,
} from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';

const FaChevronRight = () => (
  <i className="icon">
    <FontAwesomeIcon icon={faChevronRight} className="icon" />
  </i>
);

const FaChevronLeft = () => (
  <i className="icon">
    <FontAwesomeIcon icon={faChevronLeft} className="icon" />
  </i>
);

const getDateString = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const loc = `/locations/${year}-${('0' + month).slice(-2)}-${(
    '0' + day
  ).slice(-2)}`;
  return loc;
};

export function LocationFilter({ year, month, day }) {
  const [modalOpen, setModalOpen] = useState(false);
  const handleOpen = useCallback(() => setModalOpen(true), [setModalOpen]);
  const handleClose = useCallback(() => setModalOpen(false), [setModalOpen]);
  const history = useHistory();

  const handleDayClick = useCallback(
    date => {
      history.push(
        `/locations/${date.getFullYear()}-${date.getMonth() +
          1}-${date.getDate()}`
      );
      setModalOpen(false);
    },
    [setModalOpen]
  );

  const handleNextClick = useCallback(() => {
    const date = new Date(year, month - 1, day);
    history.push(getDateString(addDays(date, 1)));
  }, [year, month, day]);

  const handlePrevClick = useCallback(() => {
    const date = new Date(year, month - 1, day);
    history.push(getDateString(addDays(date, -1)));
  }, [year, month, day]);

  return (
    <>
      <Modal size="small" onClose={handleClose} open={modalOpen} basic>
        <Card centered raised>
          <Calendar
            value={new Date(year, month - 1, day)}
            onClickDay={handleDayClick}
          />
        </Card>
      </Modal>
      <Grid>
        <Grid.Column width={3}>
          <Button
            color="teal"
            icon={FaChevronLeft}
            fluid
            onClick={handlePrevClick}
          />
        </Grid.Column>
        <Grid.Column width={10}>
          <Button basic color="teal" onClick={handleOpen} fluid>
            <i className="icon">
              <FontAwesomeIcon icon={faCalendar} className="icon" />
            </i>
            {new Date(
              Number(year),
              Number(month - 1),
              Number(day)
            ).toLocaleDateString()}
          </Button>
        </Grid.Column>
        <Grid.Column width={3}>
          <Button
            color="teal"
            icon={FaChevronRight}
            fluid
            onClick={handleNextClick}
          />
        </Grid.Column>
      </Grid>
      <Divider />
    </>
  );
}

LocationFilter.propTypes = {
  year: PropTypes.string.isRequired,
  month: PropTypes.string.isRequired,
  day: PropTypes.string.isRequired,
};
