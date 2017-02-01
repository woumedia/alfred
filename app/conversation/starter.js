var db = require("../db");

function parseStarterCommand(text) {
  var results = /^(add|list|remove|help)( (.*))?$/.exec(text);
  if (!results) {
    return invalidCommand;
  }

  var command = results[1];
  var argument = results[3];

  switch (command) {
  case "add":
    return addStarter.bind(null, argument);
  case "list":
    return listStarters;
  case "remove":
    return removeStarter.bind(null, argument);
  case "help":
    return helpCommand;
  default:
    return invalidCommand;
  }
}

function addStarter(text, {team_id}) {
  return db.addStarter(text, team_id)
    .then(function(resp) {
      return Promise.resolve({
        response_type: "ephemeral",
        text: "Added new conversation starter: " + text
      });
    });
}

function formatSnap(snap) {
  return snap.key + "\t" + snap.val().text + "\n";
}

function listStarters({team_id}) {
  return db.listStarters(team_id)
    .then(function(result) {
      var text = db.mapResult(result, formatSnap).join("\n");
      return Promise.resolve({
        response_type: "ephemeral",
        text: "Recorded starters:\n\n" + text
      });
    });
}

function removeStarter(id, {team_id}) {
  return db.removeStarter(id, team_id)
    .then(function(snapshot) {
      return Promise.resolve({
        response_type: "ephemeral",
        text: "Removed conversation starter: " + snapshot.val().text
      });
    });
}

var helpMessage = `Usage: /conversation-stater command [arguments]

Available commands:
\`\`\`
*add _Text_*  - Adds a new conversation starter to the database
*list*        - Lists all conversation starters in the database
*remove _Id_* - Removes a conversation starter (check *list* to get the _Id_)
*help*        - Prints this message
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

module.exports = parseStarterCommand;
