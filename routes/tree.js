var express = require('express');
var NodeCtrl = require('../controller/NodeCtrl.js');
var router = module.exports = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', NodeCtrl.insertNode);
router.delete('/', NodeCtrl.deleteNode);
router.get('/children', NodeCtrl.getChildren);
router.get('/parents', NodeCtrl.getParents);
