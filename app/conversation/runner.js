var firebase = require('../firebase-client');
var database = firebase.database();
var Promise = firebase.Promise;

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

function startConversation(team_id) {
  return Promise.resolve({
    response_type: "ephemeral",
    text: "not implemented"
  });
}

function printStats(team_id) {
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
