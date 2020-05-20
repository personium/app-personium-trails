import { addDays } from 'date-fns';

class LocationAdapter {
  constructor() {
    const dat = require('./dummy_data.json');
    // parse
    this.Stay = dat.timelineObjects
      .filter(item => 'placeVisit' in item)
      .map(item => item.placeVisit)
      .map(item => ({
        __id: Array.from(
          Array(8),
          () => parseInt(Math.random() * 10) % 10
        ).join(''),
        startTime: item.duration.startTimestampMs,
        endTime: item.duration.endTimestampMs,
        latitudeE7: item.location.latitudeE7,
        longitudeE7: item.location.longitudeE7,
        name: item.location.name,
        placeId: item.location.placeId,
      }));
    this.Visit = dat.timelineObjects
      .filter(item => 'activitySegment' in item)
      .map(item => item.activitySegment)
      .map(item => ({
        __id: Array.from(
          Array(8),
          () => parseInt(Math.random() * 10) % 10
        ).join(''),
        startTime: item.duration.startTimestampMs,
        endTime: item.duration.endTimestampMs,
        sLatitudeE7: item.startLocation.latitudeE7,
        sLongitudeE7: item.startLocation.longitudeE7,
        eLatitudeE7: item.endLocation.latitudeE7,
        eLongitudeE7: item.endLocation.longitudeE7,
      }));
  }

  async getStaysByDate(date) {
    return new Promise(resolve => {
      const from = date.getTime();
      const to = addDays(date, 1).getTime() - 1;

      resolve(
        this.Stay.filter(item => item.startTime > from && item.endTime < to)
      );
    });
  }

  async getVisitsByDate(date) {
    return new Promise(resolve => {
      const from = date.getTime();
      const to = addDays(date, 1).getTime() - 1;

      resolve(
        this.Visit.filter(item => item.startTime > from && item.endTime < to)
      );
    });
  }
}

export const adapter = new LocationAdapter();
