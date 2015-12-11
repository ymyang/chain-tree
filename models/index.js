var Sequelize = require('sequelize');
var config = require('../config.json');
var models = module.exports = {};

var sequelize = new Sequelize('chain_tree', config.mysql.username, config.mysql.password, {
	host: config.mysql.host,
	dialect: 'mysql',
	pool: {
		max: 5,
		min: 0,
		idle: 100
	}
});

models.sequelize = sequelize;
models.Sequence = sequelize.import('./Sequence.js');
models.Node = sequelize.import('./Node.js');