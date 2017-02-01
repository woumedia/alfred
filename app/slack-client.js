var WebClient = require('@slack/client').WebClient;

var token = process.env.SLACK_API_TOKEN || '';

module.exports = new WebClient(token);
