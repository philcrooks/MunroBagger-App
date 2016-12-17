var express = require('express');
var app = express();

app.use(express.static('www'));

app.listen(3000, function () {
  console.log('App running on port', this.address().port);
});