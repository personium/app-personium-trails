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
    this._loginAsync = null;
    this._refreshAsync = null;
  }

  async loginAsync() {
    console.log('start login');
    if (this._loginAsync === null) {
      console.log('');
      this._loginAsync = new Promise((resolve, reject) => {
        // fetch(`/__/auth/start_oauth2?cellUrl=${userCell}`, {
        //   credentials: 'include',
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/x-www-form-urlencoded',
        //   },
        // }).then(res => res.json());
        setTimeout(() => {
          resolve();
        }, 3000);
      });
    }
    return this._loginAsync;
  }

  async refreshAsync() {
    if (this._refreshAsync !== null) {
      console.log('already started');
      return this._refreshAsync;
    }
    console.log('start refresh newly');

    this._refreshAsync = heavyTaskAsync().then(() => {
      this._refreshAsync = null;
    });
    // this._refreshAsync = new Promise((resolve, reject) => {
    //   const data = {
    //     refresh_token: refresh_token,
    //     p_target: target_cell,
    //   };
    //   const refreshResponse = fetch(
    //     `/__/auth/refreshProtectedBoxAccessToken`,
    //     {
    //       credentials: 'include',
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //       },
    //       body: Object.entries(data)
    //         .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
    //         .join('&'),
    //     }
    //   ).then(res => res.json());
    //   setTimeout(() => {
    //     resolve();
    //   }, 1000);
    // });
  }
}

export const handler = new PersoniumLoginHandler();
