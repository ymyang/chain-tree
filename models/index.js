var Sequelize = require('sequelize');
var logger = require('../util/logger.js');
var config = require('../config.json');
var models = module.exports = {};

var sqlLog = function (content) {
	logger.debug(content);
};

var sequelize = new Sequelize('tree_demo', config.mysql.username, config.mysql.password, {
	host: config.mysql.host,
	dialect: 'mysql',
	logging: sqlLog,
	pool: {
		max: 5,
		min: 0,
		idle: 100
	}
});

models.sequelize = sequelize;
models.Sequence = sequelize.import('./Sequence.js');
models.Node = sequelize.import('./Node.js');