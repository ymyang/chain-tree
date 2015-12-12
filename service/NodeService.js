/**
 * Created by yang on 2015/6/11.
 */
var _ = require('lodash');
var Promise = require('bluebird');
var sequelize = require('../models').sequelize;
var Node = require('../models').Node;
var seq = require('../util/seq.js');

var NodeService = module.exports = {};

NodeService.insertNode = function(param) {
    return seq.getNextId().then(function (id) {
        param.nodeId = id;
        return _getParentIdsAndLayer(param.parentId);
    }).then(function(r) {
        param.parentIds = r.parentIds;
        param.layer = r.layer;
        return sequelize.transaction(function (t) {
            return Node.create(param, {transaction: t});
        });
    }).then(function(r) {
        return r.dataValues;
    });
};

NodeService.deleteNode = function(nodeid) {
    return Node.findById(nodeid).then(function (node) {
        return sequelize.transaction(function(t) {
            var options = {
                where: { $or: [
                    { nodeId: nodeid },
                    { parentIds: { $like: node.parentIds + node.nodeId + '-%'}}
                ]},
                transaction: t
            };
            return Department.destroy(options);
        });
    }).then(function (r) {
        return r;
    });
};

NodeService.getChildren = function(nodeid) {
    return Node.findById(nodeid).then(function (node) {
        var options = {
            where: {
                parentIds: { $like: node.parentIds + node.nodeId + '-%' }
            },
            order: [
                'layer',
                sequelize.literal('convert(node_name using gbk)')
            ]
        };
        return Node.findAndCountAll(options);
    }).then(function (r) {
        return {
            count: r.count,
            children: r.rows.map(function(r) {
                return r.dataValues;
            })
        };
    });
};

NodeService.getParents = function(nodeid) {
    return Node.findById(nodeid).then(function(node) {
        if (!node.parentId) {
            return [];
        }

        var parentIds = node.parentIds.split('-').filter(function(parentId) {
            return parentId;
        });
        var opts = {
            where: {
                nodeId: { $in: parentIds }
            },
            order: 'layer'
        };
        return Node.findAll(opts);
    }).then(function(rows) {
        if (!rows || !rows.length) {
            return [];
        }
        return rows.map(function(r) {
            return r.dataValues;
        });
    });
};

NodeService.copy = function(param) {
    var _nodes = undefined;
    var _topNodes = undefined;
    var _subNodes = undefined;
    var _fromId = undefined;
    return _getNodes(param.nodeIds).then(function(nodes) {
        _topNodes = nodes;
        _fromId = _getSameParentId(nodes);

        return _getAllChildren(nodes);
    }).then(function(children) {
        _subNodes = children;
        _nodes = _topNodes.concat(_subNodes);
        return seq.getNextId(_nodes.length);
    }).then(function(ids) {
        _nodes.forEach(function(n, i) {
            n.oldNodeId = n.nodeId;
            n.nodeId = ids[i];
        });
        return _getFromTo(_fromId, param.toNodeId);
    }).then(function(r) {
        var from = r.from;
        var to = r.to;

        // 修改节点信息
        _nodes.forEach(function(n) {
            n.layer = n.layer - from.layer + to.layer;
        });

        // 修改顶级节点的parentId
        _changeParentId(_topNodes, param.toNodeId);

        // 计算子节点的parentId          n
        _subNodes.forEach(function(n) {
            var parent = _nodes.filter(function(p) {
                return n.parentIds === (p.parentIds + p.oldNodeId + '-');
            })[0];
            n.parentId = parent.nodeId;
        });
        // 计算parentIds
        var toParentIds = '-';
        if (to.nodeId) {
            toParentIds = to.parentIds + to.nodeId + '-';
        }
        // 修改顶级节点的parentIds
        _topNodes.forEach(function(n) {
            delete n.oldFileId;
            n.parentIds = toParentIds;
        });
        // 计算子节点的parentIds
        _subNodes.forEach(function(n) {
            delete n.oldNodeId;
            var parent = _nodes.filter(function(p) {
                return n.parentId === p.nodeId;
            })[0];
            n.parentIds = parent.parentIds + parent.nodeId + '-';
        });
        return sequelize.transaction(function(t) {
            return Node.bulkCreate(_nodes, {transaction: t});
        });
    }).then(function() {
        return;
    });
};

NodeService.move = function(param) {
    var _nodes = undefined;
    var _topNodes = undefined;
    var _fromId = undefined;
    return _getNodes(param.nodeIds).then(function(nodes) {
        _topNodes = nodes;
        _fromId = _getSameParentId(nodes);

        return _checkMoveToSub(param.toNodeId, _fromId, nodes);
    }).then(function() {
        return _getAllChildren(_topNodes);
    }).then(function(children) {
        _nodes = _topNodes.concat(children);
        return _getFromTo(_fromId, param.toNodeId);
    }).then(function(r) {
        var from = r.from;
        var to = r.to;

        // 修改顶级节点的parentId
        _changeParentId(_topNodes, param.toNodeId);

        return sequelize.transaction(function(t) {
            var tasks = _nodes.map(function(n) {
                return Node.update({
                    parentId: n.parentId,
                    parentIds: _getNewParentIds(n, from, to),
                    layer: n.layer - from.layer + to.layer
                }, { where: { nodeId: n.nodeId }, transaction: t });
            });
            return Promise.all(tasks);
        });
    }).then(function() {
        return;
    });
};

/**
 * 通过 parentId 获取 parentIds和layer
 * @param parentId
 * @returns {Promise}
 */
function _getParentIdsAndLayer(parentId) {
    var r = {
        parentIds: '-',
        layer: 0
    };
    if (parentId) {
        return Node.findById(parentId).then(function(parent) {
            r.parentIds = parent.parentIds || '-';
            r.parentIds += parent.nodeId + '-';
            r.layer = parent.layer + 1;
            return r;
        })
    } else {
        return Promise.resolve(r);
    }
}

function _checkSameNameNode(node) {
    var options = {
        where: {
            parentId: node.parentId || null,
            nodeName: node.nodeName
        }
    };
    if (node.nodeId) {
        options.where.nodeId = { $ne: node.nodeId};
    }
    return Node.findOne(options).then(function(r) {
        if (f) {
            var err = new Error();
            err.message = node.nodeName + ' already exists';
            throw err;
        }
        return;
    });
}

function _checkSameNameNodes(nodes, toNodeId) {
    var tasks = nodes.map(function(n) {
        return _checkSameNameNode({
            parentId: toNodeId,
            nodeName: n.nodeName
        });
    });
    return Promise.all(tasks);
}

function _checkMoveToSub(toNodeId, fromNodeId, nodes) {
    if (!toNodeId) {
        return Promise.resolve();
    }

    return Node.findById(toNodeId).then(function(toNode) {
        var p1 = toNode.parentIds + toNode.nodeId + '-';
        if (fromNodeId) {
            return Node.findById(fromNodeId).then(function(from) {
                var p2 = from.parentIds + from.nodeId + '-';
                if (p1.indexOf(p2) === 0) {
                    var err = new Error();
                    err.message = 'can not move to the sub node: ' + n.nodeName;
                    throw err;
                }
                return;
            });
        }

        nodes.forEach(function(n) {
            var p2 = n.parentIds + n.nodeId + '-';
            if (p1.indexOf(p2) === 0) {
                var err = new Error();
                err.message = 'can not move to the sub node: ' + n.nodeName;
                throw err;
            }
        });

        return;
    });
}

function _getNodes(nodeIds) {
    var options = {
        where: {
            nodeId: { $in: nodeIds }
        }
    };
    return Node.findAll(options).then(function(rows) {
        return rows.map(function(r) {
            return r.dataValues;
        });
    });
}

function _getAllChildren(nodes) {
    return Promise.reduce(nodes, function(total, node) {
        total = total || [];
        return _getChildren(node).then(function(children) {
            return total.concat(children);
        });
    }, 0);
}

function _getChildren(node) {
    var options = {
        where: {
            parentIds: { $like: node.parentIds + node.nodeId + '-%'}
        }
    };
    return Node.findAll(options).then(function(rows) {
        return rows.map(function(r) {
            return r.dataValues;
        });
    });
}

function _getFromTo(fromNodeId, toNodeId) {
    return Promise.props({
        from: fromNodeId ? Node.findById(fromNodeId) : Promise.resolve({ nodeId: undefined, parentIds: '-', layer: -1 }),
        to: toNodeId ? Node.findById(toNodeId) : Promise.resolve({ nodeId: undefined, parentIds: '-', layer: -1 })
    });
}


function _changeParentId(nodes, parentId) {
    nodes.forEach(function(n) {
        // 修改parentId
        n.parentId = parentId ? parentId : null;
    });
}

function _getSameParentId(nodes) {
    return _getSameValue(nodes, 'parentId');
}

function _getSameValue(nodes, key) {
    if (nodes && nodes.length) {
        var v = nodes[0][key];
        if (nodes.length > 1) {
            var f = nodes.every(function(f) {
                return f[key] === v;
            });
            if (!f) {
                var err = new Error();
                err.message = 'nodes are not in a same ' + key;
                throw err;
            }
        }
        return v;
    }
    var err = new Error();
    err.message = 'nodes are empty';
    throw err;
}

function _changeParentId(nodes, parentId) {
    nodes.forEach(function(n) {
        // 修改parentId
        n.parentId = parentId ? parentId : null;
    });
}

function _getNewParentIds(node, from, to) {
    var fromParentIds = '-';
    if (from.nodeId) {
        fromParentIds = from.parentIds + from.nodeId + '-';
    }
    var toParentIds = '-';
    if (to.nodeId) {
        toParentIds = to.parentIds + to.nodeId + '-';
    }
    return _replaceStart(node.parentIds, fromParentIds, toParentIds);
}

function _replaceStart(str, start, newStart) {
    if (start == newStart) {
        return str;
    }
    var s = str;
    if (start && _.startsWith(str, start)) {
        s = str.substring(start.length);
    }
    if (newStart) {
        s = newStart + s;
    }
    return s;
}