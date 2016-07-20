'use strict';

import Sequelize from 'sequelize';
import config from './util/config.js';

let sequelize = new Sequelize('chain_tree', config.mysql.username, config.mysql.password, {
	host: config.mysql.host,
	dialect: 'mysql',
	pool: {
		max: 5,
		min: 0,
		idle: 100
	}
});

let Sequence = sequelize.import('./models/Sequence.js');
let Node = sequelize.import('./models/Node.js');

export { sequelize, Sequence, Node };