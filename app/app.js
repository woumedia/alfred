var express = require('express');
var firebase = require('./firebase');
var app = express();

app.set('port', (process.env.PORT || 8080));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(app.get('port'), function () {
  console.log('Example app listening on port ' + app.get('port') + '!');
});
