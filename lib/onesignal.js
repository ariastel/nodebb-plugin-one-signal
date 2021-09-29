'use strict';

const undici = require('undici');

const constants = require('./constants');
const logger = require('./logger');
const { db, meta, nconf, translator, user, utils } = require('./nodebb');
const { getAbsolutePath } = require('./utils');


const OneSignal = {};

/**
 * @param {number} uid
 * @returns {Record<string, unknown>}
 */
OneSignal.getUserSettings = async function getUserSettings(uid) {
	return user.getSettings(uid);
};

/**
 * @param {number} uid
 * @param {Record<string, unknown>} notification
 * @param {{ language: string, topicPostSort: string }} user_settings
 * @param {{ app_id: string, api_key: string }} app_settings
 */
OneSignal.pushToUid = async function (uid, notification, user_settings, { app_id, api_key }) {
	try {
		if (notification.hasOwnProperty('path')) {
			notification.path = getAbsolutePath(notification.path);
		}

		const language = user_settings.language || meta.config.defaultLang || 'en-GB';

		const title = await translator.translate(notification.bodyShort, language);

		const payload = {
			name: notification.nid,
			app_id: app_id,
			include_external_user_ids: [String(uid)],
			url: notification.path || `${nconf.get('url')}/notifications`,
		};
		if (notification.bodyLong) {
			const body = await translator.translate(notification.bodyLong, language);
			payload.headings = { en: utils.stripHTMLTags(title) || '' };
			payload.contents = { en: utils.stripHTMLTags(body) };
		} else {
			payload.contents = { en: utils.stripHTMLTags(title) || '' };
		}

		logger.verbose(`Sending push notification to uid ${uid}`);
		console.log(payload);

		const response = await undici.request(constants.PUSH_URL, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'content-type': 'application/json',
				authorization: `Basic ${api_key}`,
			},
		});
		const json = await response.body.json();
		console.log(json);

		if (json.hasOwnProperty('errors')) {
			json.errors.forEach((err) => {
				logger.error(`(uid: ${uid})] ${err}`);
			});
		}
	} catch (err) {
		logger.error(`(uid: ${uid}) ${err.message}`);
	}
};

OneSignal.push = async function (data) {
	const { uids, notification } = data;

	if (!Array.isArray(uids) || !uids.length || !notification) {
		return;
	}


	try {
		const pluginSettings = await meta.settings.get(constants.PLUGIN_TOKEN);
		if (!pluginSettings.id || !pluginSettings.secret) {
			return;
		}

		const userSettingsKeys = uids.map(uid => `user:${uid}:settings`);
		const settings = await db.getObjectsFields(userSettingsKeys, ['onesignal:enabled', 'language']);

		uids.forEach((uid, index) => {
			if (!settings[index]) {
				return;
			}

			if (
				settings[index]['onesignal:enabled'] === null ||
				parseInt(settings[index]['onesignal:enabled'], 10) === 1
			) {
				OneSignal.pushToUid(
					uid,
					notification,
					settings[index],
					{
						app_id: pluginSettings.id,
						api_key: pluginSettings.secret,
					}
				);
			}
		});
	} catch (err) {
		logger.error(err);
	}
};

module.exports = OneSignal;
