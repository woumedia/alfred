var db = require("../db");
var slack = require("../slack-client");
var eventRouter = require("../event/router");
var _ = require("lodash");

function parseRunnerCommand(text) {
  var results = /^(start|stats|wrap-up)( (.*))?$/.exec(text);
  if (!results) {
    return invalidCommand;
  }

  var command = results[1];
  var argument = results[3];

  switch (command) {
  case "start":
    return startConversation;
  case "stats":
    return printStats;
  case "wrap-up":
    return wrapUpConversation;
  default:
    return invalidCommand;
  }
}

function buildResult(result) {
  var allResults = Object.keys(result.results)
      .map(userId => `<@${userId}> got ${result.results[userId]} points`)
      .join("\n");
  var winner =  `<@${result.winner.userId}> won with ${result.winner.points} points\n\n`;

  return winner + allResults;
}

function reportResult(teamId, result) {
  var message = buildResult(result);
  return db.getTeamData(teamId)
    .then(({webhookUrl}) => slack.webhook(webhookUrl, message));
}

function startConversation({team_id, channel_id}) {
  return db.finishConversation(team_id)
    .then(function(result) {
      if (result) {
        return reportResults(team_id, result);
      } else {
        return Promise.resolve();
      }
    })
    .then(function() {
      return db.getLeastUsedStarter(team_id);
    })
    .then(function(result) {
      var timesUsed = (result.val().timesUsed || 0) + 1;
      var text = result.val().text;
      return db.updateStarter(result.key, team_id, {timesUsed})
        .then(function() {
          return db.startConversation(text, channel_id, team_id);
        })
        .then(function() {
          return Promise.resolve({
            response_type: "in_channel",
            text: "Today's topic: " + text
          });
        });
    });
}

function wrapUpConversation({team_id}) {
  return db.finishConversation(team_id)
    .then(function(results) {
      if (results) {
        return Promise.resolve({
          response_type: "in_channel",
          text: buildResult(results)
        });
      } else {
        return Promise.resolve({
          response_type: "ephemeral",
          text: "No conversation in progress."
        });
      }
    });
}

function printStats({team_id}) {
  return Promise.resolve({
    response_type: "ephemeral",
    text: "not implemented"
  });
}

function invalidCommand() {
  return Promise.resolve({
    response_type: "ephemeral",
    text: "Invalid command."
  });
}

module.exports = parseRunnerCommand;
