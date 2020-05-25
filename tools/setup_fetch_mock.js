import fetchMock from 'fetch-mock';

const DEV_CELL = 'https://dev-user.personium.localhost/';
const DUMMY_ACCESS_TOKEN = 'dummy_access_token';
const DUMMY_REFRESH_TOKEN = 'dummy_refresh_token';

fetchMock.post(
  'path:/__/auth/start_oauth2',
  () =>
    new Promise(res => {
      setTimeout(() => {
        res({
          access_token: DUMMY_ACCESS_TOKEN,
          refresh_token_expires_in: 86400,
          refresh_token: DUMMY_REFRESH_TOKEN,
          p_target: 'DEV_CELL',
          scope: 'root',
          token_type: 'Bearer',
          expires_in: 3600,
        });
      }, 3000);
    }),
  {
    query: {
      cellUrl: DEV_CELL,
    },
  }
);

fetchMock.post(
  'path:/__/auth/refreshProtectedBoxAccessToken',
  () =>
    new Promise(res => {
      setTimeout(
        () =>
          res({
            access_token: DUMMY_ACCESS_TOKEN,
            refresh_token_expires_in: 86400,
            refresh_token: DUMMY_REFRESH_TOKEN,
            p_target: DEV_CELL,
            scope: 'root',
            token_type: 'Bearer',
            expires_in: 3600,
          }),
        3000
      );
    }),
  {
    sendAsJson: true,
    // ToDo: implement
    // body: {
    //   p_target: DEV_CELL,
    // },
  }
);
// fetchMock.post()
