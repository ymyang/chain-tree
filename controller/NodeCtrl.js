/**
 * Created by yang on 2015/12/9.
 */
'use strict';

const TAG = '[NodeCtrl]';
import NodeService from '../service/NodeService.js';
import NodeParam from '../params/nodes';
import logger from '../util/logger.js';

export default {
    insertNode,
    deleteNode,
    getChildren,
    getParents
}

export function insertNode(req, res) {
    let param = new NodeParam(req.body);
    NodeService.insertNode(param).then((r) => {
        res.json(r || {status: 'ok'});
    }).catch((err) => {
        logger.error(TAG, 'insertNode', err);
        res.status(err.status || 500);
        res.send(err.message);
    });
}

export function deleteNode(req, res) {
    NodeService.deleteNode(req.query.nodeid).then((r) => {
        res.json(r || {status: 'ok'});
    }).catch((err) => {
        logger.error(TAG, 'deleteNode', err);
        res.status(err.status || 500);
        res.send(err.message);
    });
}

export function getChildren(req, res) {
    NodeService.getChildren(req.query.nodeid).then((r) => {
        res.json(r || {status: 'ok'});
    }).catch((err) => {
        logger.error(TAG, 'getChildren', err);
        res.status(err.status || 500);
        res.send(err.message);
    });
}

export function getParents(req, res) {
    NodeService.getParents(req.query.nodeid).then((r) => {
        res.json(r || {status: 'ok'});
    }).catch((err) => {
        logger.error(TAG, 'getParents', err);
        res.status(err.status || 500);
        res.send(err.message);
    });
}