'use strict';


$(document).ready(() => {
	if (!app.user.uid) {
		return;
	}

	$.getScript('https://cdn.onesignal.com/sdks/OneSignalSDK.js', () => {
		require(['translator'], function (translator) {
			socket.emit('plugins.one-signal.onesignal', { language: translator.getLanguage() }, (err, settings) => {
				if (err) {
					console.error(err);
					return;
				}

				const OneSignal = window.OneSignal || [];
				OneSignal.push(function () {
					OneSignal.setExternalUserId(String(app.user.uid));
					OneSignal.SERVICE_WORKER_PARAM = { scope: '/one-signal-sdk/' };
					OneSignal.SERVICE_WORKER_PATH = 'one-signal-sdk/OneSignalSDKWorker.js';
					OneSignal.SERVICE_WORKER_UPDATER_PATH = 'one-signal-sdk/OneSignalSDKUpdaterWorker.js';
					OneSignal.init({
						appId: settings.app_id,
						safari_web_id: settings.safari_web_id,
						allowLocalhostAsSecureOrigin: true,
						autoResubscribe: true,
						notifyButton: {
							enable: true,
							size: 'medium',
							position: 'bottom-right',
							offset: {
								bottom: '50px',
								right: '50px',
							},
							colors: {
								'circle.background': '#EB4141',
								'circle.foreground': 'white',
								'badge.background': '#EB4141',
								'badge.foreground': '#EB4141',
								'badge.bordercolor': '#EB4141',
							},
							text: settings.translations,
							showCredit: false,
							displayPredicate: () => OneSignal.isPushNotificationsEnabled().then(isPushEnabled => !isPushEnabled),
						},
					});
				});
			});
		});
	});
});
