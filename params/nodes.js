/**
 * Created by yang on 2015/6/1.
 */
var _ = require('lodash');
var nodes = module.exports = {};

nodes.NodeParam = function(attrs) {
    this.nodeId = undefined;
    this.nodeName = undefined;
    this.parentId = undefined;

    attrs && _.extend(this,  attrs);
};
