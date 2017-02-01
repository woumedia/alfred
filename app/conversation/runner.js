var db = require("../db");
var eventRouter = require("../event/router");

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

function startConversation({team_id, channel_id}) {

  return db.finishConversation(team_id)
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
    .then(function() {
      return Promise.resolve({
        response_type: "in_channel",
        text: "Who won?"
      });
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
