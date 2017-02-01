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
      return firebase.database().ref("teams/" + resp.team_id)
        .set({
          accessToken: resp.access_token,
          scope: resp.scope,
          botUserId: resp.bot.bot_user_id,
          botAccessToken: resp.bot.bot_access_token,
          webhookChannelId: resp.incoming_webhook.channel_id,
          webhookUrl: resp.incoming_webhook.url,
          webhookConfigUrl: resp.incoming_webhook.configuration_url
        });
    });
}

module.exports = authenticate;
