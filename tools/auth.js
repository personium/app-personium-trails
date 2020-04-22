const config = require('../config');
const Request = require('request-promise');

const authClient = (() => {
  const request = Request.defaults({
    proxy: config.network.https_proxy,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return {
    getTokenROPC: function(cellURL, username, password) {
      const uri = `${cellURL}__token`;
      console.log(uri);
      return request(uri, {
        method: 'POST',
        form: {
          grant_type: 'password',
          username,
          password,
        },
      }).then(JSON.parse);
    },
  };
})();

module.exports = authClient;
