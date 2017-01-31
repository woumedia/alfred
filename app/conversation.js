var express = require('express');
var router = express.Router();
var firebase = require('./firebase-client');

function parseCommand(text) {
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

function addStarter(text) {
  return firebase.database().ref("starters")
    .push({
      text: text
    })
    .then(function(resp) {
      return firebase.Promise.resolve({
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

function listStarters() {
  return firebase.database().ref("starters")
    .once("value")
    .then(function(snapshot) {
      var text = map(snapshot, formatSnap).join("\n");
      return firebase.Promise.resolve({
        response_type: "ephemeral",
        text: "Recorded starters:\n\n" + text
      });
    });
}

function removeStarter(id) {
  var ref = firebase.database().ref("starters/" + id);

  return ref.once("value")
    .then(function(snapshot) {
      var text = snapshot.val().text;
      return ref
        .remove()
        .then(function() {
          return firebase.Promise.resolve({
            response_type: "ephemeral",
            text: "Removed conversation starter: " + text
          });
        });
    });
}

function invalidCommand() {
  return firebase.Promise.resolve({
    response_type: "ephemeral",
    text: "Invalid command."
  });
}

router.post('/starters', function (req, res) {
  parseCommand(req.body.text)()
    .then(function(result) {
      res.send(result);
    }, function (error) {
      console.error(error);
      return res.send("An error occurred");
    });
});

module.exports = router;
