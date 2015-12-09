const TAG = '[app]';
var http = require('http');
var morgan = require('morgan');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('./util/logger.js');

var routes = require('./routes/index');
var tree = require('./routes/tree');

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.disable('x-powered-by');

app.use(function (req, res, next) {
  var params = '';
  var str = req.headers['content-type'] || '';
  var mime = str.split(';')[0];
  if (req.body && mime === 'application/json') {
    params += "[body]: " + JSON.stringify(req.body);
  }
  //console.log('Express [uri]: ', req.url, ", ", params);
  logger.debug('Express [uri]:', req.url, ",", params);
  next();
});

app.use('/', routes);
app.use('/tree', tree);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found:' + req.url);
  err.status = 404;
  next(err);
});

// error handlers

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  logger.error('[url]:', req.url, err);
  res.status(err.status || 500);
  res.send(err.message);
});

var server = http.createServer(app);
server.listen(3000);

server.on('listening', onListening);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  logger.info(TAG, 'Listening on ', bind);
}
