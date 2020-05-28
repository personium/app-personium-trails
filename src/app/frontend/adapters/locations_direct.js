import { addDays } from 'date-fns';
import { handler } from '../lib/personium_auth_adapter';
import { o } from 'odata';

class LocationDirectAdapter {
  constructor() {
    this.oHandler = null;
    this.current_access_token = null;
    this.current_box_url = null;
  }

  refreshOHandler() {
    // ToDo: refine codes
    if (
      handler.accessToken.access_token === this.prev_access_token &&
      handler.boxUrl === this.current_box_url
    )
      return;

    this.oHandler = o(`${handler.boxUrl}current/`, {
      headers: {
        Authorization: `Bearer ${handler.accessToken.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    this.current_box_url = handler.boxUrl;
    this.current_access_token = handler.accessToken.access_token;
  }
  async getEntityByDate(entityName, date) {
    this.refreshOHandler();
    const from = date.getTime();
    const to = addDays(date, 1).getTime() - 1;

    return await this.oHandler
      .get(entityName)
      .query({
        $filter: `startTime ge ${from} and endTime lt ${to}`,
        $format: 'json',
      })
      .then(res => {
        console.log(res);
        return res;
      })
      .then(res => res.d.results);
  }
  async getDetail(entityName, __id) {
    this.refreshOHandler();
    return await this.oHandler
      .get(`${entityName}('${__id}')`)
      .query({ $format: 'json' })
      .then(res => res.d.results);
  }
  async getStaysByDate(date) {
    return await this.getEntityByDate('Stay', date);
  }

  async getMovesByDate(date) {
    return await this.getEntityByDate('Move', date);
  }

  async getStayDetail(__id) {
    return await this.getDetail('Stay', __id);
  }

  async getMoveDetail(__id) {
    return await this.getDetail('Move', __id);
  }
}

export const adapter = new LocationDirectAdapter();
