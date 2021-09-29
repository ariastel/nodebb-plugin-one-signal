'use strict';

module.exports = {
	batch: require.main.require('./src/batch'),
	db: require.main.require('./src/database'),
	meta: require.main.require('./src/meta'),
	user: require.main.require('./src/user'),
	routesHelpers: require.main.require('./src/routes/helpers'),
	translator: require.main.require('./src/translator'),
	SocketPlugins: require.main.require('./src/socket.io/plugins'),
	utils: require.main.require('./src/utils'),
	LRU: require.main.require('lru-cache'),

	nconf: require.main.require('nconf'),
	winston: require.main.require('winston'),
};
