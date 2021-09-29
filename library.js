'use strict';

const constants = require('./lib/constants');
const controllers = require('./lib/controllers');
const logger = require('./lib/logger');
const { db, meta, routesHelpers, SocketPlugins } = require('./lib/nodebb');
const onesignal = require('./lib/onesignal');
const sockets = require('./lib/sockets');


let app;

const OneSignalPlugin = {
	config: {},

	hooks: {
		actions: {},
		filters: {},
		statics: {
			load: async function (params) {
				const { router, middleware } = params;
				app = params.app;

				routesHelpers.setupAdminPageRoute(router, `/admin/plugins/${constants.PLUGIN_TOKEN}`, middleware, [], controllers.renderACP);
				router.get('/OneSignalSDKWorker.js', controllers.OneSignalSDKWorker);
				router.get('/OneSignalSDKUpdaterWorker.js', controllers.OneSignalSDKUpdaterWorker);

				OneSignalPlugin.config = await meta.settings.get(constants.PLUGIN_TOKEN)
					.catch((err) => {
						logger.error(err);
						return null;
					});
				if (!OneSignalPlugin.config) {
					logger.error('Please complete OneSignal setup');
				}

				SocketPlugins[constants.PLUGIN_TOKEN] = sockets;
			},
		},
	},
};

/**
 * Called on `filter:admin.header.build`
 */
OneSignalPlugin.hooks.filters.adminHeaderBuild = async function (header) {
	header.plugins.push({
		route: `/plugins/${constants.PLUGIN_TOKEN}`,
		icon: 'fa-mobile',
		name: 'One Signal',
	});
	return header;
};

/**
 * Called on `filter:user.customSettings`
 */
OneSignalPlugin.hooks.filters.userCustomSettings = async function (payload) {
	if (!OneSignalPlugin.config.id || !OneSignalPlugin.config.secret) {
		return payload;
	}

	const { uid } = payload;
	const settings = await onesignal.getUserSettings(uid);
	const settingsHtml = await app.renderAsync('partials/account/settings/one-signal', {
		'onesignal:enabled': Number(settings['onesignal:enabled']) === 1,
	});

	payload.customSettings.push({
		title: '[[one-signal:settings.title]]',
		content: settingsHtml,
	});

	return payload;
};

/**
 * Called on `filter:user.saveSettings`
 */
OneSignalPlugin.hooks.filters.userSaveSettings = async function (payload) {
	payload.settings['onesignal:enabled'] = payload.data['onesignal:enabled'];
	return payload;
};

/**
 * Called on `action:notification.pushed`
 */
OneSignalPlugin.hooks.actions.notificationPushed = async function (data) {
	return onesignal.push(data);
};

module.exports = OneSignalPlugin;
