import { addDays } from 'date-fns';
import { authState as handler } from '../lib/personium_auth_adapter';
import { statDirectory } from './webdav';
import { o } from 'odata';
import EventEmitter from 'events';

export const getYMDFromDate = date => {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${y}/${('0' + m).slice(-2)}${('0' + d).slice(-2)}`;
};
export const getYMD = timestampms => {
  const date = new Date(timestampms);
  return getYMDFromDate(date);
};

class LocationStatListener {
  constructor() {
    this.emitter = new EventEmitter();
    this.lastStat = new Map();
  }

  subscribe(filename, fn, silent = false) {
    this.emitter.on(filename, fn);
    if (!silent && this.lastStat.has(filename)) {
      fn(this.lastStat.get(filename));
    }
  }

  unsubscribe(filename, fn) {
    this.emitter.off(filename, fn);
  }

  fire(filename, stat) {
    console.log('emit', filename, stat);
    this.lastStat.set(filename, stat);
    this.emitter.emit(filename, stat);
  }
}

export const statListener = new LocationStatListener();

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

    this.oHandler = o(`${handler.boxUrl}index/`, {
      headers: {
        Authorization: `Bearer ${handler.accessToken.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    this.current_box_url = handler.boxUrl;
    this.current_access_token = handler.accessToken.access_token;
  }

  async getTimelineByDate(date) {
    // fetch stat and fire event
    const from = getYMDFromDate(date);
    const to = getYMDFromDate(addDays(date, 1));
    const days = Array.from(new Set([from, to]));
    return Promise.all(
      days.map(ymd =>
        statDirectory(
          `${this.current_box_url}locations/${ymd}`,
          this.current_access_token
        )
      )
    )
      .then(results => new Map([].concat(...results.map(res => [...res]))))
      .then(results => {
        [...results].forEach(([key, val]) => statListener.fire(key, val));
        return results;
      });
  }

  async getEntityByDate(entityName, date) {
    this.refreshOHandler();
    const from = date.getTime();
    const to = addDays(date, 1).getTime() - 1;

    return await this.oHandler
      .get(entityName)
      .query({
        $filter: `startTime ge ${from} and startTime lt ${to}`,
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
