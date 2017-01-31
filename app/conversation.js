var express = require('express');
var router = express.Router();
var starter = require('./conversation/starter');
var runner = require('./conversation/runner');

function dispatchCommand(dispatcher, req, res) {
  dispatcher(req.body.text)(req.body.team_id)
    .then(function(result) {
      res.send(result);
    }, function(error) {
      console.error(error);
      return res.send("An error occurred");
    });
}

router.post('/starters', function (req, res) {
  dispatchCommand(starter, req, res);
});

router.post('/run', function (req, res) {
  dispatchCommand(runner, req, res);
});

module.exports = router;
