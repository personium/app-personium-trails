import React from 'react';
import PropTypes from 'prop-types';
import { PersoniumLoading } from '../parts/PersoniumLoading';

export function LoadingPage({ message, body, bodyUrl }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
      }}
    >
      <div style={{ flexGrow: 1 }} />
      <PersoniumLoading />
      <>
        <h1>{message}</h1>
        <p>{body ? <a href={bodyUrl}>{body}</a> : null}</p>
      </>
      <div style={{ flexGrow: 1 }} />
    </div>
  );
}

LoadingPage.propTypes = {
  message: PropTypes.string,
  body: PropTypes.string,
  bodyUrl: PropTypes.string,
};
