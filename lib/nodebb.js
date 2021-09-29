'use strict';

module.exports = {
	batch: require.main.require('./src/batch'),
	db: require.main.require('./src/database'),
	meta: require.main.require('./src/meta'),
	user: require.main.require('./src/user'),
	posts: require.main.require('./src/posts'),
	topics: require.main.require('./src/topics'),
	routesHelpers: require.main.require('./src/routes/helpers'),
	translator: require.main.require('./src/translator'),
	SocketPlugins: require.main.require('./src/socket.io/plugins'),
	globalMiddleware: require.main.require('./src/middleware'),
	utils: require.main.require('./src/utils'),
	LRU: require.main.require('lru-cache'),

	winston: require.main.require('winston'),
	nconf: require.main.require('nconf'),
	async: require.main.require('async'),
};
