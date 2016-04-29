/**
 * Created by yang on 2015/6/11.
 */
'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import models from '../models';
import { sequelize, Node } from '../models';
import seq from '../util/seq.js';

export function insertNode(param) {
    return seq.getNextId().then((id) => {
        param.nodeId = id;
        return _getParentIdsAndLayer(param.parentId);
    }).then((r) => {
        param.parentIds = r.parentIds;
        param.layer = r.layer;
        return sequelize.transaction((t) => {
            return Node.create(param, {transaction: t});
        });
    }).then((r) => {
        return r.dataValues;
    });
};

export function deleteNode(nodeid) {
    return Node.findById(nodeid).then((node) => {
        return sequelize.transaction((t) => {
            let options = {
                where: { $or: [
                    { nodeId: nodeid },
                    { parentIds: { $like: node.parentIds + node.nodeId + '-%'}}
                ]},
                transaction: t
            };
            return Department.destroy(options);
        });
    }).then((r) => {
        return r;
    });
};

export function getChildren(nodeid) {
    return Node.findById(nodeid).then((node) => {
        let options = {
            where: {
                parentIds: { $like: node.parentIds + node.nodeId + '-%' }
            },
            order: [
                'layer',
                sequelize.literal('convert(node_name using gbk)')
            ]
        };
        return Node.findAndCountAll(options);
    }).then((r) => {
        return {
            count: r.count,
            children: r.rows.map((r) => {
                return r.dataValues;
            })
        };
    });
};

export function getParents(nodeid) {
    return Node.findById(nodeid).then((node) => {
        if (!node.parentId) {
            return [];
        }

        let parentIds = node.parentIds.split('-').filter((parentId) => {
            return parentId;
        });
        let opts = {
            where: {
                nodeId: { $in: parentIds }
            },
            order: 'layer'
        };
        return Node.findAll(opts);
    }).then((rows) => {
        if (!rows || !rows.length) {
            return [];
        }
        return rows.map((r) => {
            return r.dataValues;
        });
    });
};

export function copy(param) {
    let _nodes = undefined;
    let _topNodes = undefined;
    let _subNodes = undefined;
    let _fromId = undefined;
    return _getNodes(param.nodeIds).then((nodes) => {
        _topNodes = nodes;
        _fromId = _getSameParentId(nodes);

        return _getAllChildren(nodes);
    }).then((children) => {
        _subNodes = children;
        _nodes = _topNodes.concat(_subNodes);
        return seq.getNextId(_nodes.length);
    }).then((ids) => {
        _nodes.forEach((n, i) => {
            n.oldNodeId = n.nodeId;
            n.nodeId = ids[i];
        });
        return _getFromTo(_fromId, param.toNodeId);
    }).then((r) => {
        let from = r.from;
        let to = r.to;

        // 修改节点信息
        _nodes.forEach((n) => {
            n.layer = n.layer - from.layer + to.layer;
        });

        // 修改顶级节点的parentId
        _changeParentId(_topNodes, param.toNodeId);

        // 计算子节点的parentId          n
        _subNodes.forEach((n) => {
            let parent = _nodes.filter((p) => {
                return n.parentIds === (p.parentIds + p.oldNodeId + '-');
            })[0];
            n.parentId = parent.nodeId;
        });
        // 计算parentIds
        let toParentIds = '-';
        if (to.nodeId) {
            toParentIds = to.parentIds + to.nodeId + '-';
        }
        // 修改顶级节点的parentIds
        _topNodes.forEach((n) => {
            delete n.oldFileId;
            n.parentIds = toParentIds;
        });
        // 计算子节点的parentIds
        _subNodes.forEach((n) => {
            delete n.oldNodeId;
            let parent = _nodes.filter((p) => {
                return n.parentId === p.nodeId;
            })[0];
            n.parentIds = parent.parentIds + parent.nodeId + '-';
        });
        return sequelize.transaction((t) => {
            return Node.bulkCreate(_nodes, {transaction: t});
        });
    }).then(() => {
        return;
    });
};

export function move(param) {
    let _nodes = undefined;
    let _topNodes = undefined;
    let _fromId = undefined;
    return _getNodes(param.nodeIds).then((nodes) => {
        _topNodes = nodes;
        _fromId = _getSameParentId(nodes);

        return _checkMoveToSub(param.toNodeId, _fromId, nodes);
    }).then(() => {
        return _getAllChildren(_topNodes);
    }).then((children) => {
        _nodes = _topNodes.concat(children);
        return _getFromTo(_fromId, param.toNodeId);
    }).then((r) => {
        let from = r.from;
        let to = r.to;

        // 修改顶级节点的parentId
        _changeParentId(_topNodes, param.toNodeId);

        return sequelize.transaction((t) => {
            let tasks = _nodes.map((n) => {
                return Node.update({
                    parentId: n.parentId,
                    parentIds: _getNewParentIds(n, from, to),
                    layer: n.layer - from.layer + to.layer
                }, { where: { nodeId: n.nodeId }, transaction: t });
            });
            return Promise.all(tasks);
        });
    }).then(() => {
        return;
    });
};

/**
 * 通过 parentId 获取 parentIds和layer
 * @param parentId
 * @returns {Promise}
 */
function _getParentIdsAndLayer(parentId) {
    let r = {
        parentIds: '-',
        layer: 0
    };
    if (parentId) {
        return Node.findById(parentId).then((parent) => {
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
    let options = {
        where: {
            parentId: node.parentId || null,
            nodeName: node.nodeName
        }
    };
    if (node.nodeId) {
        options.where.nodeId = { $ne: node.nodeId};
    }
    return Node.findOne(options).then((r) => {
        if (f) {
            let err = new Error();
            err.message = node.nodeName + ' already exists';
            throw err;
        }
        return;
    });
}

function _checkSameNameNodes(nodes, toNodeId) {
    let tasks = nodes.map((n) => {
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

    return Node.findById(toNodeId).then((toNode) => {
        let p1 = toNode.parentIds + toNode.nodeId + '-';
        if (fromNodeId) {
            return Node.findById(fromNodeId).then((from) => {
                let p2 = from.parentIds + from.nodeId + '-';
                if (p1.indexOf(p2) === 0) {
                    let err = new Error();
                    err.message = 'can not move to the sub node: ' + n.nodeName;
                    throw err;
                }
                return;
            });
        }

        nodes.forEach((n) => {
            let p2 = n.parentIds + n.nodeId + '-';
            if (p1.indexOf(p2) === 0) {
                let err = new Error();
                err.message = 'can not move to the sub node: ' + n.nodeName;
                throw err;
            }
        });

        return;
    });
}

function _getNodes(nodeIds) {
    let options = {
        where: {
            nodeId: { $in: nodeIds }
        }
    };
    return Node.findAll(options).then((rows) => {
        return rows.map((r) => {
            return r.dataValues;
        });
    });
}

function _getAllChildren(nodes) {
    return Promise.reduce(nodes, (total, node) => {
        total = total || [];
        return _getChildren(node).then((children) => {
            return total.concat(children);
        });
    }, 0);
}

function _getChildren(node) {
    let options = {
        where: {
            parentIds: { $like: node.parentIds + node.nodeId + '-%'}
        }
    };
    return Node.findAll(options).then((rows) => {
        return rows.map((r) => {
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
    nodes.forEach((n) => {
        // 修改parentId
        n.parentId = parentId ? parentId : null;
    });
}

function _getSameParentId(nodes) {
    return _getSameValue(nodes, 'parentId');
}

function _getSameValue(nodes, key) {
    if (nodes && nodes.length) {
        let v = nodes[0][key];
        if (nodes.length > 1) {
            let f = nodes.every((f) => {
                return f[key] === v;
            });
            if (!f) {
                let err = new Error();
                err.message = 'nodes are not in a same ' + key;
                throw err;
            }
        }
        return v;
    }
    let err = new Error();
    err.message = 'nodes are empty';
    throw err;
}

function _changeParentId(nodes, parentId) {
    nodes.forEach((n) => {
        // 修改parentId
        n.parentId = parentId ? parentId : null;
    });
}

function _getNewParentIds(node, from, to) {
    let fromParentIds = '-';
    if (from.nodeId) {
        fromParentIds = from.parentIds + from.nodeId + '-';
    }
    let toParentIds = '-';
    if (to.nodeId) {
        toParentIds = to.parentIds + to.nodeId + '-';
    }
    return _replaceStart(node.parentIds, fromParentIds, toParentIds);
}

function _replaceStart(str, start, newStart) {
    if (start == newStart) {
        return str;
    }
    let s = str;
    if (start && _.startsWith(str, start)) {
        s = str.substring(start.length);
    }
    if (newStart) {
        s = newStart + s;
    }
    return s;
}