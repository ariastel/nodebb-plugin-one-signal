'use strict';

require(['hooks'], (hooks) => {
	hooks.on('action:ajaxify.end', function (data) {
		if (data.tpl_url && data.tpl_url === 'account/settings') {
			$('#onesignal-test').off('click').on('click', function () {
				socket.emit('plugins.one-signal.test', function (err) {
					if (err) {
						app.alertError(err.message);
						return;
					}
					app.alertSuccess('[[one-signal:settings.send-test.sent]]');
				});
			});


			$('input[data-property="onesignal:enabled"]').off('change').on('change', function (e) {
				if (!e.target.checked) {
					return;
				}

				const OneSignal = window.OneSignal || [];

				function getSubscriptionState() {
					return Promise.all([
						OneSignal.isPushNotificationsEnabled(),
						OneSignal.isOptedOut(),
					]).then(function (result) {
						return {
							isPushEnabled: result[0],
							isOptedOut: result[1],
						};
					});
				}

				OneSignal.push(function () {
					// If we're on an unsupported browser, do nothing
					if (!OneSignal.isPushNotificationsSupported()) {
						return;
					}
					getSubscriptionState().then(function (state) {
						if (state.isPushEnabled) {
							return;
						}
						if (state.isOptedOut) {
							/* Opted out, opt them back in */
							OneSignal.setSubscription(true);
						} else {
							/* Unsubscribed, subscribe them */
							OneSignal.registerForPushNotifications();
						}
					});
				});
			});
		}
	});
});
