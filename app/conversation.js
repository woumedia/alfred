var express = require('express');
var router = express.Router();
var firebase = require('./firebase-client');
var starter = require('./conversation/starter');
var runner = require('./conversation/runner');

router.post('/starters', function (req, res) {
  starter(req.body.text)()
    .then(function(result) {
      res.send(result);
    }, function(error) {
      console.error(error);
      return res.send("An error occurred");
    });
});

router.post('/run', function (req, res) {
  runner(req.body.text)()
    .then(function(result) {
      res.send(result);
    }, function(error) {
      console.error(error);
      return res.send("An error occurred");
    });
});

module.exports = router;
