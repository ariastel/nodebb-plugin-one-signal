'use strict';

const url = require('url');

const { nconf } = require('./nodebb');


/**
 * @param {string} path
 * @returns {string}
 */
function getAbsolutePath(path) {
	const urlObj = url.parse(path, false, true);
	let result = path;

	if (!urlObj.host && !urlObj.hostname) {
		if (path.startsWith('/')) { // This is a relative path
			result = path.slice(1);
		}
		result = url.resolve(`${nconf.get('url')}/`, path);
	}

	return result;
}

module.exports = { getAbsolutePath };
