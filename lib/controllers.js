'use strict';

const path = require('path');


const Controllers = {};

Controllers.renderACP = async function (req, res) {
	return res.render('admin/plugins/one-signal', {});
};

Controllers.OneSignalSDKWorker = function (req, res) {
	res.sendFile('OneSignalSDKWorker.js', {
		root: path.join(
			__dirname,
			'../static/lib/'
		),
	});
};

Controllers.OneSignalSDKUpdaterWorker = function (req, res) {
	res.sendFile('OneSignalSDKUpdaterWorker.js', {
		root: path.join(
			__dirname,
			'../static/lib/'
		),
	});
};

module.exports = Controllers;
