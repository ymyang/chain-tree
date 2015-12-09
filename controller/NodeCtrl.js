/**
 * Created by yang on 2015/12/9.
 */
const TAG = '[NodeCtrl]';
var NodeService = require('../service/NodeService.js');
var NodeParam = require('../params/nodes').NodeParam;
var logger = require('../util/logger.js');

var NodeCtrl = module.exports = {};

NodeCtrl.insertNode = function(req, res) {
    var param = new NodeParam(req.body);
    NodeService.insertNode(param).then(function(r) {
        res.json(r || {status: 'ok'});
    }).catch(function(err) {
        logger.error(TAG, 'insertNode', err);
        res.status(err.status || 500);
        res.send(err.message);
    });
};

NodeCtrl.deleteNode = function(req, res) {
    NodeService.deleteNode(req.query.nodeid).then(function(r) {
        res.json(r || {status: 'ok'});
    }).catch(function(err) {
        logger.error(TAG, 'deleteNode', err);
        res.status(err.status || 500);
        res.send(err.message);
    });
};

NodeCtrl.getChildren = function(req, res) {
    NodeService.getChildren(req.query.nodeid).then(function(r) {
        res.json(r || {status: 'ok'});
    }).catch(function(err) {
        logger.error(TAG, 'getChildren', err);
        res.status(err.status || 500);
        res.send(err.message);
    });
};

NodeCtrl.getParents = function(req, res) {
    NodeService.getParents(req.query.nodeid).then(function(r) {
        res.json(r || {status: 'ok'});
    }).catch(function(err) {
        logger.error(TAG, 'getParents', err);
        res.status(err.status || 500);
        res.send(err.message);
    });
};