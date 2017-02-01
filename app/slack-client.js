var WebClient = require('@slack/client').WebClient;
var IncomingWebhook = require('@slack/client').IncomingWebhook;

var token = process.env.SLACK_API_TOKEN || '';

var web = new WebClient(token);

function webhook(url, msg) {
  var webhook = new IncomingWebhook(url);
  return webhook.send(msg);
}

module.exports = {
  oauth: web.oauth,
  channels: web.channels,
  webhook: webhook
};
