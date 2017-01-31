require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var conversation = require('./conversation');
var eventRouter = require('./event/router');
var app = express();

var eventVerification = process.env.SLACK_EVENT_TOKEN;

app.set('port', (process.env.PORT || 8080));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use('/conversation', conversation);

app.post('/event', function(req, res) {
  if (req.body.token == eventVerification) {
    eventRouter.dispatch(req.body.event, res);
  } else {
    res.status(400).send("Bad token");
  }
});

app.listen(app.get('port'), function () {
  console.log('Example app listening on port ' + app.get('port') + '!');
});
