/**
 * Created by yang on 2015/6/1.
 */
'use strict';

import _ from 'lodash';

export class NodeParam {

    constructor(attrs) {
        this.nodeId = undefined;
        this.nodeName = undefined;
        this.parentId = undefined;

        attrs && _.extend(this,  attrs);
    }

};
