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
 * @param {number[]} uids
 * @param {Record<string, unknown>} notification
 * @param {string} userLang
 * @param {{ app_id: string, api_key: string }} app_settings
 */
OneSignal.pushToUids = async function (uids, notification, userLang, { app_id, api_key }) {
	try {
		if (notification.hasOwnProperty('path')) {
			notification.path = getAbsolutePath(notification.path);
		}

		const language = userLang || meta.config.defaultLang || 'en-GB';

		const title = await translator.translate(notification.bodyShort, language);

		const payload = {
			name: notification.nid,
			app_id: app_id,
			include_external_user_ids: uids.map(uid => String(uid)),
			url: notification.path || `${nconf.get('url')}/notifications`,
		};
		if (notification.bodyLong) {
			const body = await translator.translate(notification.bodyLong, language);
			payload.headings = { en: utils.stripHTMLTags(title) || '' };
			payload.contents = { en: utils.stripHTMLTags(body) };
		} else {
			payload.contents = { en: utils.stripHTMLTags(title) || '' };
		}

		logger.verbose(`Sending push notification to uid ${uids}`);
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
				logger.error(`(uids: ${uids})] ${err}`);
			});
		}
	} catch (err) {
		logger.error(`(uids: ${uids}) ${err.message}`);
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
		const settings = await db.getObjectsFields(userSettingsKeys, ['onesignal:enabled', 'userLang']);

		const languages = new Map();
		uids.forEach((uid, index) => {
			if (!settings[index]) {
				return;
			}

			const oneSignalEnabled = settings[index]['onesignal:enabled'];
			const { userLang } = settings[index];

			if (oneSignalEnabled === null || parseInt(oneSignalEnabled, 10) === 1) {
				if (!languages.has(userLang)) {
					languages.set(userLang, new Set());
				}
				languages.get(userLang).add(uid);
			}
		});

		for (const [language, uids] of languages.entries()) {
			OneSignal.pushToUids(
				Array.from(uids),
				notification,
				language,
				{
					app_id: pluginSettings.id,
					api_key: pluginSettings.secret,
				}
			);
		}
	} catch (err) {
		logger.error(err);
	}
};

module.exports = OneSignal;
