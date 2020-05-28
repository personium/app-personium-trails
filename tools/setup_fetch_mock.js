import fetchMock from 'fetch-mock';
import dummyData from './dummy_data.json';

const DEV_CELL = 'https://dev-user.personium.localhost/';
const BOX_NAME = 'app-personium-trails';
const DUMMY_ACCESS_TOKEN = 'dummy_access_token';
const DUMMY_REFRESH_TOKEN = 'dummy_refresh_token';

class DummyLocation {
  constructor(dat) {
    // info
    this.JsonDat = new Map();

    // parse
    this.Stay = dat.timelineObjects
      .filter(item => 'placeVisit' in item)
      .map(item => item.placeVisit)
      .map(item => {
        const __id = Array.from(
          Array(8),
          () => parseInt(Math.random() * 10) % 10
        ).join('');
        this.JsonDat[__id] = item;
        const converted = {
          __id,
          startTime: parseInt(item.duration.startTimestampMs),
          endTime: parseInt(item.duration.endTimestampMs),
          latitudeE7: item.location.latitudeE7,
          longitudeE7: item.location.longitudeE7,
          name: item.location.name,
          placeId: item.location.placeId,
        };
        return converted;
      });
    this.Visit = dat.timelineObjects
      .filter(item => 'activitySegment' in item)
      .map(item => item.activitySegment)
      .map(item => {
        const __id = Array.from(
          Array(8),
          () => parseInt(Math.random() * 10) % 10
        ).join('');
        this.JsonDat[__id] = item;
        const converted = {
          __id,
          startTime: parseInt(item.duration.startTimestampMs),
          endTime: parseInt(item.duration.endTimestampMs),
          sLatitudeE7: item.startLocation.latitudeE7,
          sLongitudeE7: item.startLocation.longitudeE7,
          eLatitudeE7: item.endLocation.latitudeE7,
          eLongitudeE7: item.endLocation.longitudeE7,
        };
        return converted;
      });
  }
}

const dummyLocation = new DummyLocation(dummyData);

fetchMock.get(
  `${DEV_CELL}__box`,
  new Response('', {
    headers: { location: `${DEV_CELL}${BOX_NAME}/` },
  })
);

fetchMock.get(`begin:${DEV_CELL}${BOX_NAME}/current/Stay?`, (url, opts) => {
  const decoded = decodeURI(url);
  const nums = decoded.match(/\d+/g).map(item => parseInt(item));
  const from = Math.min(...nums);
  const to = Math.max(...nums);
  return new Promise(resolve => {
    resolve(
      dummyLocation.Stay.filter(
        item => item.startTime >= from && item.endTime < to
      )
    );
  });
});

fetchMock.get(`begin:${DEV_CELL}${BOX_NAME}/current/Visit?`, (url, opts) => {
  const decoded = decodeURI(url);
  const nums = decoded.match(/\d+/g).map(item => parseInt(item));
  const from = Math.min(...nums);
  const to = Math.max(...nums);
  return new Promise(resolve => {
    const result = dummyLocation.Visit.filter(
      item => item.startTime >= from && item.endTime < to
    );
    resolve(result);
  });
});

fetchMock.get(`begin:${DEV_CELL}${BOX_NAME}/getDetail?`, (url, opts) => {
  return new Promise(resolve => {
    const decoded = decodeURI(url);
    const uuid = decoded.match(/\S*uuid=([^&]*)/);
    if (uuid !== null && uuid[1] in dummyLocation.JsonDat) {
      const result = dummyLocation.JsonDat[uuid[1]];
      return resolve(result);
    } else {
      return resolve(new Response('', { status: 404 }));
    }
  });
});

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
