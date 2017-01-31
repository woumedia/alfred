var express = require('express');
var router = express.Router();
var firebase = require('./firebase-client');
var database = firebase.database();

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
  return {
    response_type: "ephemeral",
    text: "add not implemented"
  };
}

function listStarters() {
  return {
    response_type: "ephemeral",
    text: "list not implemented"
  };
}

function removeStarter(id) {
  return {
    response_type: "ephemeral",
    text: "remove not implemented"
  };
}

function invalidCommand() {
  return {
    response_type: "ephemeral",
    text: "Invalid command."
  };
}

router.post('/starters', function (req, res) {
  var response = parseCommand(req.body.text)();
  res.send(response);
});

module.exports = router;
