var db = require("./db");
var Promise = db.Promise;

function parseRunnerCommand(text) {
  var results = /^(start|stats)( (.*))?$/.exec(text);
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
  default:
    return invalidCommand;
  }
}

function startConversation({team_id, channel_id}) {
  var starter = db.getLeastUsedStarter(team_id);

  return starter
    .then(function(result) {
      var timesUsed = (result.val().timesUsed || 0) + 1;
      var text = result.val().text;
      return db.updateStarter(result.key, team_id, {timesUsed})
        .then(function() {
          return db.setCurrentConversation(text, channel_id, team_id);
        })
        .then(function() {
          return Promise.resolve({
            response_type: "in_channel",
            text: "Today's topic: " + text
          });
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
