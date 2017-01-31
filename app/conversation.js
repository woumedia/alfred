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

function listStarters() {
  return firebase.Promise.resolve({
    response_type: "ephemeral",
    text: "list not implemented"
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
