/**
 * Created by yang on 2016/7/19.
 */
'use strict';

const path = require('path');
const jetpack = require('fs-jetpack');

let configfile = path.join(__dirname, '../config.json');

if (!jetpack.exists(configfile)) {
    configfile = path.join(__dirname, './config.json');
}

let config = jetpack.read(configfile, 'json');

export default config