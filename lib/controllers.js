'use strict';

const path = require('path');

const onesignal = require('./onesignal');
const { meta, nconf } = require('./nodebb');


const Controllers = {};

Controllers.renderACP = async function (req, res) {
	const users = await onesignal.getAssociatedUsers();
	return res.render('admin/plugins/one-signal', {
		users: users,
		usersCount: users.length,
		base_url: nconf.get('url').replace(/\/+$/, ''),
	});
};

Controllers.renderSettings = async function (req, res) {
	const devices = await onesignal.getUserDevices(req.user.uid);
	res.render('one-signal/settings', {
		site_title: meta.config.title || meta.config.browserTitle || 'NodeBB',
		setupRequired: res.locals.setupRequired,
		devices: devices,
	});
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
