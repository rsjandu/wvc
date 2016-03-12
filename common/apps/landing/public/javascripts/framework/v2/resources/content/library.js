define(function(require) {
	var $           = require('jquery');
	var events      = require('events');
	window.jade     = require('jade');
	var log         = require('log')('library', 'info');
	var upload      = require('./upload');
	var player      = require('./player');

	var library = {};
	var f_handle_cached;
	var viewer_list = {};

	events.bind ('content:upload', handle_new_content, 'library');

	library.init = function (display_spec, custom, perms, f_handle) {
		f_handle_cached = f_handle;
		init_handlers ();
		return true;
	};

	/*
	 * Called upon creation of a new tab */
	library.start = function (handle) {
		var viewer;
		var anchor = handle.anchor;
		var anchor_id = $(anchor).attr('id');
		var _d = $.Deferred ();

		/*
		 * Load the library template */

		var template = f_handle_cached.template('library');
		var content_area_id = make_content_area_id (anchor_id);
		$(anchor).append (template ({}));

		upload.start ({
			anchor : $(anchor).find('.content-lib-upload'),
			tab_anchor : anchor
		});

		populate_library ($(anchor).find('.content-lib-main'));

		_d.resolve ();
		return _d.promise ();
	};

	function populate_library ($anchor_lib) {

		get_content ()
			.then (
				__populate.bind($anchor_lib), handle_error.bind($anchor_lib)
			);
	}

	function handle_error (err) {
		log.error ('TODO: handle this error');
	}

	function get_content () {
		var key = 'get-content';
		var val = { user_id : 'arvind@authorgen.com' };

		return f_handle_cached.send_command (null, key, val, 0);
	}

	function __populate (content_arr) {
		var $anchor_lib = this;

		log.info ('populating with ', content_arr);
		for (var i = 0; i < content_arr.data.length; i++) {
			var info = content_arr.data[i];
			var template = f_handle_cached.template('library-item');
			var library_item = template (info);

			/*
			 * The info looks like this:
			 *     __v: 0
			 *     _id: "56dada11117a43a0fda531bb"
			 *     ctime: "2016-03-05T13:07:29.821Z"
			 *     dir: "/"
			 *     name: "gpM4Y2_1457183205532_aSes_1.pdf"
			 *     owner: "arvind@authorgen.com"
			 *     size: 379345
			 *     tags: Array[1]
			 *     type: "application/pdf"
			 *     url: "https://boxcontent.s3.amazonaws.com/bad5990bee174609a36993f621e9d7ff"
			 */

			$anchor_lib.find('.content-lib-items ul').append(library_item);
		}
	}

	function init_handlers () {
		$('#widget-tabs').on('click', 'button.content-test-gen-url', handle_gen_url);
	}

	function make_content_area_id (anchor_id) {
		return 'content-area-' + anchor_id	;
	}

	function handle_gen_url (ev) {
		var key = 'get-tmp-url';
		var val = {
			dir       : '',
			file_name : 'abc.txt',
			file_type : 'txt',
			user_id   : 'avinash.bhatia@gmail.com'
		};

		log.info ('handle_gen_url handler');

		f_handle_cached.send_command (null, key, val, 0)
			.then(
					function () {
						log.info ('remote command "' + key + '->' + val + '" ok');
					},
					function (err) {
						log.error ('remote command "' + key +  '->' + val + '" failed: reason: ' + err);
					}
			     );
	}

	function handle_new_content (ev, data) {
		switch (ev) {
			case 'content-added' : 
				var tab    = $(data.tab);
				var url    = data.conv_url;

				/* remove the library from the anchor */
				tab.empty ();
				player.start (tab, url);
				break;

			default :
				log.error ('unknown event "' + ev + '". possibly a bug in the code. ignoring.');
		}
	}

	return library;

});
