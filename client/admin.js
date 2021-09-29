'use strict';

define('admin/plugins/one-signal', ['settings'], function (Settings) {
	var ACP = {};

	ACP.init = function () {
		Settings.load('one-signal', $('.one-signal-settings'));
		$('#save').on('click', saveSettings);
	};

	function saveSettings() {
		Settings.save('one-signal', $('.one-signal-settings'), function () {
			app.alert({
				type: 'success',
				alert_id: 'one-signal-saved',
				title: 'Reload Required',
				message: 'Please reload your NodeBB to complete configuration of the OneSignal plugin',
				clickfn: function () {
					socket.emit('admin.reload');
				},
			});
		});
	}

	return ACP;
});
