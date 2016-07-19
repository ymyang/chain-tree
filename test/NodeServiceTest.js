/**
 * Created by yang on 2015/12/9.
 */
'use strict';

const NodeService = require('../build/service/NodeService.js');

describe('NodeService', () => {
    it('insertNode', (done) => {
        let p = {
            nodeName: 'node-2',
            //parentId: 116
        };
        NodeService.insertNode(p).then((r) => {
            console.log('insertNode:', r);
            done();
        }).catch(done);
    });

    it('deleteNode', (done) => {
        let nodeid = 1;
        NodeService.deleteNode(nodeid).then(() => {
            console.log('deleteNode ok');
            done();
        }).catch(done);
    });

    it.only('getChildren', (done) => {
        let nodeid = 106;
        NodeService.getChildren(nodeid).then((r) => {
            console.log('getChildren:', r);
            done();
        }).catch(done);
    });

    it('getParents', (done) => {
        let nodeid = 167;
        NodeService.getParents(nodeid).then((r) => {
            console.log('getParents:', r);
            done();
        }).catch(done);
    });

    it('copy', (done) => {
        let p = {
            nodeIds: [116],
            toNodeId: 131
        };
        NodeService.copy(p).then(() => {
            console.log('copy ok');
            done();
        }).catch(done);
    });


    it('move', (done) => {
        let p = {
            nodeIds: [166],
            toNodeId: 121
        };
        NodeService.move(p).then(() => {
            console.log('move ok');
            done();
        }).catch(done);
    });
});