'use strict';

const TAG = '[app]';
import http from 'http';
import morgan from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from './util/logger.js';

import routes from './routes';

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.disable('x-powered-by');

app.use('/', routes);

const server = http.createServer(app);
server.listen(3000);

server.on('listening', () => {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log(TAG, 'Listening on ', bind);
});

