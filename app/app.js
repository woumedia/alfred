require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var conversation = require('./conversation');
var oauth = require('./oauth');
var eventRouter = require('./event/router');
var app = express();

var verificationToken = process.env.SLACK_VERIFICATION_TOKEN;

app.set('port', (process.env.PORT || 8080));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use('/conversation', conversation);

app.post('/event', function(req, res) {
  console.log("/event request", req.body);
  if (req.body.token === verificationToken) {
    eventRouter.dispatch(req.body, res);
  } else {
    res.status(400).send("Bad token");
  }
});

app.get('/oauth/slack', function(req, res) {
  oauth(req.query.code)
    .then(function() {
      res.sendStatus(200);
    }, function() {
      res.sendStatus(403);
    });
});

app.listen(app.get('port'), function () {
  console.log('Example app listening on port ' + app.get('port') + '!');
});
