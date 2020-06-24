class PersoniumAuthState {
  constructor() {
    this.accessToken = null;
    this.boxUrl = null;
    this._targetCell = null;
    this._schemaUrl = null;
  }

  async updateBoxUrl() {
    const boxUrl = await getBoxUrl(
      this._targetCell,
      this.accessToken,
      this._schemaUrl
    );
    this.boxUrl = boxUrl;
    console.log(this);
    return authState;
  }
}

export const authState = new PersoniumAuthState();

async function getBoxUrl(targetCell, { access_token }, schemaUrl = null) {
  const requestURL = new URL(`${targetCell}__box`);
  if (schemaUrl !== null) {
    requestURL.searchParams.set('schema', schemaUrl);
  }
  const res = await fetch(requestURL, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!res.ok) throw res;
  return res.headers.get('location');
}

class PersoniumLoginROPC {
  constructor(targetCell, username, password, schemaUrl) {
    this._loginAsync = null;
    this._refreshAsync = null;
    this._username = username;
    this._password = password;
    this._targetCell = targetCell;
    this._schemaUrl = schemaUrl;
  }

  async loginAsync() {
    if (this._loginAsync !== null) {
      console.log('`loginAsync` is already started');
      return this._loginAsync;
    }

    console.log('`loginAsync` is started newly');

    return (this._loginAsync = new Promise((resolve, reject) => {
      const data = new URLSearchParams();
      data.set('grant_type', 'password');
      data.set('username', this._username);
      data.set('password', this._password);
      fetch(`${this._targetCell}__token`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      })
        .then(res => {
          if (!res.ok) {
            throw {
              status: res.status,
              statusText: res.statusText,
            };
          }
          return res.json();
        })
        .then(jsonDat => {
          this._loginAsync = null;
          authState.accessToken = jsonDat;
          authState._targetCell = this._targetCell;
          authState._schemaUrl = this._schemaUrl;
          authState.boxUrl = null;
          resolve(authState);
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
      const data = new URLSearchParams();
      data.set('grant_type', 'refresh_token');
      data.set('refresh_token', authState.accessToken.refresh_token);
      fetch(`${this._targetCell}__token`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      })
        .then(res => res.json())
        .then(jsonDat => {
          this._refreshAsync = null;
          authState.accessToken = jsonDat;
          resolve();
        })
        .catch(reject);
    }));
  }
}

class PersoniumLoginHandler {
  constructor(targetCell) {
    this._loginAsync = null;
    this._refreshAsync = null;
    this.boxUrl = null;
    this._targetCell = targetCell;
  }

  async loginAsync(appCell = '/', authInfo = null) {
    if (this._loginAsync !== null) {
      console.log('`loginAsync` is already started');
      return this._loginAsync;
    }

    console.log('`loginAsync` is started newly');
    return (this._loginAsync = new Promise((resolve, reject) => {
      let authUrl = `${appCell}__/auth/start_oauth2?cellUrl=${this._targetCell}`;
      let authMethod = 'POST';
      if (authInfo.code !== undefined && authInfo.state !== undefined) {
        // receive_redirect
        authUrl = `${appCell}__/auth/receive_redirect?cellUrl=${this._targetCell}&code=${authInfo.code}&state=${authInfo.state}`;
        authMethod = 'GET';
      }
      fetch(authUrl, {
        credentials: 'include',
        method: authMethod,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .then(res => {
          if (!res.ok) {
            return Promise.reject({
              status: res.status,
              statusText: res.statusText,
            });
          }
          if (res.headers.get('Content-Type') !== 'application/json') {
            console.log(res.headers.get('Content-Type'));
            // start oauth2 with new FORM
            const oauthFormURL = new URL(res.url);
            const redirectURI = oauthFormURL.searchParams.get('redirect_uri');
            const redirectURIobject = new URL(decodeURI(redirectURI));
            redirectURIobject.pathname = '/__/front/app';
            oauthFormURL.searchParams.set(
              'redirect_uri',
              encodeURI(redirectURIobject.toString())
            );
            console.log('oauthFormURL', oauthFormURL.toString());
            location.href = oauthFormURL.toString();
            // if (res.status === 303) {
            //   res.headers.get('Location');
            // }
            throw new Error('Not authenticated yet.');
          }
          return res.json();
        })
        .then(jsonDat => {
          this._loginAsync = null;
          authState.accessToken = jsonDat;
          authState._targetCell = this._targetCell;
          authState.boxUrl = null;
          resolve(authState);
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
      const data = new URLSearchParams();
      data.set('refresh_token', authState.accessToken.refresh_token);
      data.set('p_target', this._targetCell);
      fetch(`/__/auth/refreshProtectedBoxAccessToken`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      })
        .then(res => res.json())
        .then(jsonDat => {
          this._refreshAsync = null;
          authState.accessToken = jsonDat;
          resolve();
        })
        .catch(reject);
    }));
  }
}

export { PersoniumLoginROPC, PersoniumLoginHandler };
