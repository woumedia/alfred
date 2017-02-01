var express = require('express');
var router = express.Router();
var starter = require('./conversation/starter');
var runner = require('./conversation/runner');

var verificationToken = process.env.SLACK_VERIFICATION_TOKEN;

function dispatchCommand(dispatcher, req, res) {
  if (req.body.token === verificationToken) {
    dispatcher(req.body.text)(req.body)
      .then(function(result) {
        res.send(result);
      }, function(error) {
        console.error(error);
        return res.send("An error occurred");
      });
  } else {
    res.status(400).send("Bad token");
  }
}

router.post('/starters', function (req, res) {
  dispatchCommand(starter, req, res);
});

router.post('/run', function (req, res) {
  dispatchCommand(runner, req, res);
});

module.exports = router;
