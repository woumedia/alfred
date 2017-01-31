require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var conversation = require('./conversation');
var app = express();

app.set('port', (process.env.PORT || 8080));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use('/conversation', conversation);

app.listen(app.get('port'), function () {
  console.log('Example app listening on port ' + app.get('port') + '!');
});
