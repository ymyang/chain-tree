/**
 * Created by yang on 2015/6/2.
 */
'use strict';

import winston from "winston";
import config from './config.js';

let customLevels = {
    levels: {
        trace: 0,
        debug: 1,
        info: 2,
        warn: 3,
        error: 4
    },
    colors: {
        trace: 'blue',
        debug: 'green',
        info: 'grey',
        warn: 'yellow',
        error: 'red'
    }
};

winston.addColors(customLevels.colors);

export default new (winston.Logger)({
    levels: customLevels.levels,
    transports: [
        new (winston.transports.Console)({
            level: 'error',
            colorize: true,
            handleExceptions: true
        })
    ],
    exitOnError: false
});
