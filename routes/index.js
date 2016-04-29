'use strict';

import express from 'express';
import logger from '../util/logger.js';
import tree from './tree.js';

let router = express.Router();


router.use((req, res, next) => {
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


router.use(tree);



// catch 404 and forward to error handler
router.use((req, res, next) => {
  var err = new Error('Not Found:' + req.url);
  err.status = 404;
  next(err);
});

// error handlers

// production error handler
// no stacktraces leaked to user
router.use((err, req, res, next) => {
  logger.error('[url]:', req.url, err);
  res.status(err.status || 500);
  res.send(err.message);
});

export default router;