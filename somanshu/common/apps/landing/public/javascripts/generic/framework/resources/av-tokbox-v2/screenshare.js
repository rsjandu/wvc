define(function (require) {
	var $            = require('jquery');
	var log          = require('log')('av-screenshare', 'info');
	var layout       = require('./layout');
	var tokbox       = require('./tokbox');

	var screenshare = {};
	var f_handle_cached;
	var custom_config_cached;
	var publisher;

	screenshare.init = function (f_handle, custom) {
		f_handle_cached = f_handle;
		custom_config_cached = custom;

		$('.remodal-confirm').click(close_modal);

		/* Screenshare menu handler */
		$('#widget-nav li#nav-screenshare a').on('click', screenshare.start);

		return null;
	};

	screenshare.start = function () {
		var d = $.Deferred ();

		tokbox.registerScreenSharingExtension('chrome', custom_config_cached.chromeextensionid);

		check_capability()
			.then(
				function (extension_installed) {
					if (extension_installed) {
						d.resolve();
						return really_start ();
					}

					/* 
					 * If the extension is not installed then
					 * prompt the user to install. */
					prompt_for_installation (d);
				},
				function (err) {
					f_handle_cached.notify.alert(err);
					d.reject(err);
				}
			);

		return d.promise ();
	};

	function check_capability () {
		var d = $.Deferred();

		tokbox.checkScreenSharingCapability (function (res) {

			if ( !res.supported || res.extensionRegistered === false ) {
				d.reject('screensharing not supported');
			} 
			else if ( res.extensionInstalled === false ) {
				d.resolve(false);
			} 
			else {
				d.resolve(true);
			}
		});

		return d.promise();
	}

	function really_start () {
		var i_am = f_handle_cached.identity.display_name;
		var cont = layout.get_container ('screenshare-local');

		tokbox.init_publisher (i_am, null, cont.div(), { videoSource : 'screen' })
			.then(
				function (na, _publisher) {
					publisher = _publisher;
					tokbox.publish (publisher);
					layout.reveal_video(cont);
				},
				function (err) {
					log.error ('screenshare: failed to initialize publisher: ' + err);
				}
			);
	}

	/*
	 * Handle the modal */
	var modal;
	function prompt_for_installation (d) {
		var href = 'https://chrome.google.com/webstore/detail/' + custom_config_cached.chromeextensionid;
		modal = $('[data-remodal-id=browser-extension-download]').remodal({ closeOnConfirm : false });

		$("a[href='chromeSSExtPath']").attr('href', href);
		modal.open();
	}

	function close_modal () {
		modal.close ();
	}

	return screenshare;

});
