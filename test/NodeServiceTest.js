/**
 * Created by yang on 2015/12/9.
 */

var NodeService = require('../service/NodeService.js');

describe('NodeService', function() {
    it('insertNode', function(done) {
        var p = {
            nodeId: 12,
            nodeName: 'node-12',
            parentId: 1
        };
        NodeService.insertNode(p).then(function(r) {
            console.log('insertNode:', JSON.stringify(r));
            done();
        }).catch(done);
    });

    it('deleteNode', function(done) {
        var nodeid = 1;
        NodeService.deleteNode(nodeid).then(function() {
            console.log('deleteNode ok');
            done();
        }).catch(done);
    });

    it('getChildren', function(done) {
        var nodeid = 1;
        NodeService.getChildren(nodeid).then(function(r) {
            console.log('getChildren:', JSON.stringify(r));
            done();
        }).catch(done);
    });

    it.only('getParents', function(done) {
        var nodeid = 12;
        NodeService.getParents(nodeid).then(function(r) {
            console.log('getParents:', JSON.stringify(r));
            done();
        }).catch(done);
    });
});