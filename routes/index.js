var express = require('express');
var logger = require('../util/logger.js');

var router = module.exports = express.Router();


router.use(function (req, res, next) {
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


router.use(require('./tree.js'));



// catch 404 and forward to error handler
router.use(function(req, res, next) {
  var err = new Error('Not Found:' + req.url);
  err.status = 404;
  next(err);
});

// error handlers

// production error handler
// no stacktraces leaked to user
router.use(function(err, req, res, next) {
  logger.error('[url]:', req.url, err);
  res.status(err.status || 500);
  res.send(err.message);
});

