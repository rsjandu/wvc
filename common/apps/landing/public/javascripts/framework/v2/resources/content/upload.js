define(function(require) {
	var $           = require('jquery');
	window.jade     = require('jade');
	var identity    = require('identity');
	var log         = require('log')('upload', 'info');
	var file_upload = require('./jquery-file-upload-9.11.2/js/for-vc/jquery.fileupload');
	var jquery_ui   = require('./jquery-file-upload-9.11.2/js/for-vc/jquery.ui.widget');

	var upload = {};
	var f_handle_cached;

	upload.init = function (display_spec, custom, perms, f_handle) {
		f_handle_cached = f_handle;
		init_handlers ();
		return true;
	};

	/*
	 * This is called upon the creation of a new tab */
	upload.start = function (anchor) {
		var upload_span = anchor.find('.content-upload-label');
		var upload_input = anchor.find('.content-upload-input');

		upload_span.on('click', function (ev) {
			upload_input.trigger('click');
		});

		upload_input.on('change', function (ev) {
			var files = $(ev.currentTarget)[0].files;
			if (!files || files.length === 0)
				return;

			get_presigned_url (files[0])
				.then (
					upload_start,
					function (err) {
						log.error ('session returned err  = ', err);
					}
				);
		});
	};

	function upload_start (data) {
		var file_obj = upload_info[data.file_name].file;

		var xhr = new XMLHttpRequest();
		xhr.open("PUT", data.upload_url);
		xhr.setRequestHeader('x-amz-acl', 'public-read');
		//xhr.upload.addEventListener("progress", update_progress);
		xhr.onload = function() {
			//upload_success(xhr.status,data.file_name, file_obj);
			log.info ('upload ok');
		};
		xhr.onerror = function() {
			alert("Could not upload file.");
		};
		xhr.send(file_obj);

	}

	function init_handlers () {
	}

	function make_content_area_id (anchor_id) {
		return 'content-area-' + anchor_id	;
	}

	function get_presigned_url (file) {
		var key = 'get-tmp-url';
		var val = {
			dir       : '',
			file_name : file.name,
			file_type : file.type ? file.type : file.name.replace(/^.*\./g, ''),
			user_id   : 'avinash.bhatia@gmail.com'
		};

		log.info ('get_presigned_url: sending ', val);

		/*
		 * Send command to the session side couternpart */
		return f_handle_cached.send_command (null, key, val, 0);
	}

	return upload;

});
