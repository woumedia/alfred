var slack = require("./slack-client");
var db = require("./db");

var clientId = process.env.SLACK_CLIENT_ID || "";
var clientSecret = process.env.SLACK_CLIENT_SECRET || "";

function authenticate(code) {
  if (!code) {
    return Promise.reject("missing code");
  }

  return slack.oauth.access(clientId, clientSecret, code)
    .then(function(resp) {
      var channelId = resp.incoming_webhook.channel_id;
      var token = resp.bot.bot_access_token;
      var setTeam = db.setTeamData({
        accessToken: resp.access_token,
        scope: resp.scope,
        botUserId: resp.bot.bot_user_id,
        botAccessToken: token,
        webhookChannelId: channelId,
        webhookUrl: resp.incoming_webhook.url,
        webhookConfigUrl: resp.incoming_webhook.configuration_url
      }, resp.team_id);
      var joinChannel = slack.channels.join(token, channelId);
      return Promise.all([setTeam, joinChannel]);
    });
}

module.exports = authenticate;
