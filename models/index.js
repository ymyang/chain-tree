'use strict';

import Sequelize from 'sequelize';
import config from '../config.json';

let sequelize = new Sequelize('chain_tree', config.mysql.username, config.mysql.password, {
	host: config.mysql.host,
	dialect: 'mysql',
	pool: {
		max: 5,
		min: 0,
		idle: 100
	}
});

let Sequence = sequelize.import('./Sequence.js');
let Node = sequelize.import('./Node.js');

export { sequelize, Sequence, Node };