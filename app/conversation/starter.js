var firebase = require('./firebase-client');
var database = firebase.database();
var Promise = firebase.Promise;

function parseStarterCommand(text) {
  var results = /^(add|list|remove)( (.*))?$/.exec(text);
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
  default:
    return invalidCommand;
  }
}

function addStarter(text, team_id) {
  return database.ref("starters/" + team_id)
    .push({
      text: text
    })
    .then(function(resp) {
      return Promise.resolve({
        response_type: "ephemeral",
        text: "Added new conversation starter: " + text
      });
    });
}

function map(collection, callback) {
  var elements = [];
  collection.forEach(function(element) {
    elements.push(callback(element));
  });
  return elements;
}

function formatSnap(snap) {
  return snap.key + "\t" + snap.val().text + "\n";
}

function listStarters(team_id) {
  return database.ref("starters/" + team_id)
    .once("value")
    .then(function(snapshot) {
      var text = map(snapshot, formatSnap).join("\n");
      return Promise.resolve({
        response_type: "ephemeral",
        text: "Recorded starters:\n\n" + text
      });
    });
}

function removeStarter(id, team_id) {
  var ref = database.ref("starters/" + team_id + "/" + id);

  return ref.once("value")
    .then(function(snapshot) {
      var text = snapshot.val().text;
      return ref
        .remove()
        .then(function() {
          return Promise.resolve({
            response_type: "ephemeral",
            text: "Removed conversation starter: " + text
          });
        });
    });
}

function invalidCommand() {
  return Promise.resolve({
    response_type: "ephemeral",
    text: "Invalid command."
  });
}

module.exports = parseStarterCommand;
