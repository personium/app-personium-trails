import { addDays } from 'date-fns';
import { authState as handler } from '../lib/personium_auth_adapter';

class LocationAdapter {
  async getStaysByDate(date) {
    const from = date.getTime();
    const to = addDays(date, 1).getTime() - 1;
    return await (
      await fetch(
        `${handler.boxUrl}index/Stay?$filter=startTime ge ${from} and endTime lt ${to}`
      )
    ).json();
  }

  async getVisitsByDate(date) {
    const from = date.getTime();
    const to = addDays(date, 1).getTime() - 1;
    return await (
      await fetch(
        `${handler.boxUrl}index/Visit?$filter=startTime ge ${from} and endTime lt ${to}`
      )
    ).json();
  }

  async getDetail(__id) {
    return fetch(`${handler.boxUrl}getDetail?uuid=${__id}`).then(res =>
      res.json()
    );
  }
}

export const adapter = new LocationAdapter();
