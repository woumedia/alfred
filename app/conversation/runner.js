var db = require("../db");
var slack = require("../slack-client");
var eventRouter = require("../event/router");
var _ = require("lodash");

function parseRunnerCommand(text) {
  var results = /^(start|stats|wrap-up|help)( (.*))?$/.exec(text);
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
  case "help":
    return helpCommand;
  default:
    return invalidCommand;
  }
}

function buildResult(result) {
  var allResults = Object.keys(result.results)
      .map(userId => `<@${userId}> got ${result.results[userId]} points :+1:`)
      .join("\n");
  var winner =  `<@${result.winner.userId}> is winning with ${result.winner.points} points :boom::tada::confetti_ball:\n\n`;

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
      if (result && Object.keys(result).length > 0) {
        return reportResult(team_id, result);
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
            text: `Today's topic: *${text}* :nerd_face:

Remember to mention me in the reply :robot_face:.
All the team members can vote for the best share by adding reactions to posts.
Post with the most reactions wins! :raised_hands:
`,
            mrkdwn: true
          });
        });
    });
}

function wrapUpConversation({team_id}) {
  return db.finishConversation(team_id)
    .then(function(results) {
      if (results && Object.keys(results).length === 0) {
        return Promise.resolve({
          response_type: "in_channel",
          text: "The conversation finished, sadly nobody answered :cold_sweat:"
        });
      } else if (results) {
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
  return db.loadStats(team_id)
    .then(function(stats) {
      return Promise.resolve({
        response_type: "ephemeral",
        text: buildResult(stats)
      });
    });
}

var helpMessage = `Usage: /conversation command

Available commands:
\`\`\`
*start*   - starts a conversation (terminating any previous ones)
*wrap-up* - terminates a conversation and prints point statistics
*stats*   - prints leaderboard
*help*    - prints this message
\`\`\`
`;

function helpCommand() {
  return Promise.resolve({
    response_type: "ephemeral",
    text: helpMessage,
    mrkdwn: true
  });
}

function invalidCommand() {
  return Promise.resolve({
    response_type: "ephemeral",
    text: "Invalid command.\n\n" + helpMessage,
    mrkdwn: true
  });
}

module.exports = parseRunnerCommand;
