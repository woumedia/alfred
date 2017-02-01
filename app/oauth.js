var slack = require("./slack-client");
var firebase = require("./firebase-client");

function authenticate(code) {
  if (!code) {
    return Promise.reject("missing code");
  }

  return slack.oauth.access(client_id, client_secret, code)
    .then(function(resp) {
      console.log(resp);
      return Promise.resolve(resp);
    });
}

module.exports = authenticate;
