'use strict';

const constants = require('./constants');
const { winston } = require('./nodebb');


module.exports = {
	verbose: msg => winston.verbose(`[plugin/${constants.PLUGIN_TOKEN}] ${msg}`),
	error: msg => winston.error(`[plugin/${constants.PLUGIN_TOKEN}] ${msg}`),
	warn: msg => winston.warn(`[plugin/${constants.PLUGIN_TOKEN}] ${msg}`),
};
