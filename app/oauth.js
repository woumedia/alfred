var slack = require("./slack-client");
var firebase = require("./firebase-client");

var clientId = process.env.SLACK_CLIENT_ID || "";
var clientSecret = process.env.SLACK_CLIENT_SECRET || "";

function authenticate(code) {
  if (!code) {
    return Promise.reject("missing code");
  }

  return slack.oauth.access(clientId, clientSecret, code)
    .then(function(resp) {
      console.log(resp);
      return Promise.resolve(resp);
    });
}

module.exports = authenticate;
