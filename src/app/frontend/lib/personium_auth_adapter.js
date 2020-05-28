async function heavyTaskAsync() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('heavyTaskAsync');
      resolve();
    }, 3000);
  });
}

class PersoniumLoginHandler {
  constructor() {
    this.accessToken = null;
    this.boxUrl = null;
    this._loginAsync = null;
    this._refreshAsync = null;
    this._targetCell = null;
  }

  setup(targetCell) {
    console.log('setup :', targetCell);
    this._targetCell = targetCell;
  }

  async getBoxUrl() {
    const res = await fetch(`${this._targetCell}__box`, {
      headers: { Authorization: `Bearer ${this.accessToken.access_token}` },
    });
    return res.headers.get('location');
  }

  async loginAsync() {
    if (this._loginAsync !== null) {
      console.log('`loginAsync` is already started');
      return this._loginAsync;
    }

    console.log('`loginAsync` is started newly');
    return (this._loginAsync = new Promise((resolve, reject) => {
      fetch(`/__/auth/start_oauth2?cellUrl=${this._targetCell}`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .then(res => res.json())
        .then(jsonDat => {
          this._loginAsync = null;
          this.accessToken = jsonDat;
          return this.getBoxUrl();
        })
        .then(boxUrl => {
          this.boxUrl = boxUrl;
          console.log({ boxUrl });
          resolve();
        })
        .catch(reject);
    }));
  }

  async refreshAsync() {
    if (this._refreshAsync !== null) {
      console.log('`refreshAsync` is already started');
      return this._refreshAsync;
    }

    console.log('`refreshAsync` is started newly');
    return (this._refreshAsync = new Promise((resolve, reject) => {
      const data = {
        refresh_token: this.accessToken.refresh_token,
        p_target: this._targetCell,
      };
      fetch(`/__/auth/refreshProtectedBoxAccessToken`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: Object.entries(data)
          .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
          .join('&'),
      })
        .then(res => res.json())
        .then(jsonDat => {
          this._refreshAsync = null;
          this.accessToken = jsonDat;
          resolve();
        })
        .catch(reject);
    }));
  }
}

export const handler = new PersoniumLoginHandler();
