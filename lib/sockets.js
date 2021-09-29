'use strict';

const constants = require('./constants');
const { meta, nconf, translator, utils, LRU } = require('./nodebb');
const onesignal = require('./onesignal');


const Sockets = {
	cache: new LRU(),
};

Sockets.onesignal = async function (socket, { language }) {
	if (!socket.hasOwnProperty('uid') || socket.uid <= 0) {
		throw new Error('[[error:not-logged-in]]');
	}

	const settings = await meta.settings.get(constants.PLUGIN_TOKEN);

	if (!Sockets.cache.has(language)) {
		const translations = await utils.promiseParallel({
			'tip.state.unsubscribed': translator.translate('[[one-signal:tip.state.unsubscribed]]', language),
			'tip.state.subscribed': translator.translate('[[one-signal:tip.state.subscribed]]', language),
			'tip.state.blocked': translator.translate('[[one-signal:tip.state.blocked]]', language),
			'message.prenotify': translator.translate('[[one-signal:message.prenotify]]', language),
			'message.action.subscribed': translator.translate('[[one-signal:message.action.subscribed]]', language),
			'message.action.resubscribed': translator.translate('[[one-signal:message.action.resubscribed]]', language),
			'message.action.unsubscribed': translator.translate('[[one-signal:message.action.unsubscribed]]', language),
			'dialog.main.title': translator.translate('[[one-signal:dialog.main.title]]', language),
			'dialog.main.button.subscribe': translator.translate('[[one-signal:dialog.main.button.subscribe]]', language),
			'dialog.main.button.unsubscribe': translator.translate('[[one-signal:dialog.main.button.unsubscribe]]', language),
			'dialog.blocked.title': translator.translate('[[one-signal:dialog.blocked.title]]', language),
			'dialog.blocked.message': translator.translate('[[one-signal:dialog.blocked.message]]', language),
		});
		Sockets.cache.set(language, translations);
	}

	return { app_id: settings.id, safari_web_id: settings.safari_web_id, translations: Sockets.cache.get(language) };
};

Sockets.test = async function (socket) {
	if (!socket.hasOwnProperty('uid') || socket.uid <= 0) {
		throw new Error('[[error:not-logged-in]]');
	}
	return onesignal.push({
		notification: {
			nid: 'test',
			type: 'test',
			path: `${nconf.get('relative_path')}/`,
			bodyShort: '[[one-signal:settings.send-test.title]]',
			bodyLong: '[[one-signal:settings.send-test.content]]',
		},
		uids: [socket.uid],
	});
};

module.exports = Sockets;
