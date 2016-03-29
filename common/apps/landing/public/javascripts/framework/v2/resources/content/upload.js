define(function(require) {
	var $           = require('jquery');
	var events      = require('events');
	window.jade     = require('jade');
	var identity    = require('identity');
	var log         = require('log')('upload', 'info');

	var upload = {};
	var f_handle_cached;
	var emitter = events.emitter ('content:upload', 'upload');

	upload.init = function (display_spec, custom, perms, f_handle) {
		f_handle_cached = f_handle;
		init_handlers ();
		return true;
	};

	/*
	 * This is called upon the creation of a new tab */
	upload.prepare = function (initial_data) {
		var anchor       = initial_data.anchor;
		var email        = initial_data.email;
		var upload_span  = anchor.find ('.content-upload-label');
		var upload_input = anchor.find ('.content-upload-input');
		var upload_error = anchor.find ('.content-upload-error');
		var status_span  = anchor.find ('.content-upload-status');
		var progress     = anchor.find ('.progress');

		upload_span.on('click', function (ev) {
			upload_input.trigger('click');
		});

		upload_input.on('click', function (ev) {
			update_status (status_span, '');
			upload_input.val(null);
		});

		upload_input.on('change', function (ev) {
			var files = $(ev.currentTarget)[0].files;
			if (!files || files.length === 0)
				return;

			clear_error (upload_error);
			init_progress_bar (progress);
			update_status (status_span, 'Requesting ...');

			get_presigned_url (email, files[0])
				.then (upload_start.bind(null, files, progress, status_span),     handle_error.bind('Request Failed', status_span, progress, upload_error))
				.then (upload_complete.bind(null, files, anchor, status_span),    handle_error.bind('Upload Failed', status_span, progress, upload_error))
				.then (start_conversion.bind(null, email, files, anchor, status_span),
					                                                              handle_error.bind('Upload Failed', status_span, progress, upload_error))
				.then (inform_library.bind(null, initial_data),                   handle_error.bind('Conversion Failed', status_span, progress, upload_error))
				.then (finish.bind(null, status_span),                            handle_error.bind('Post Conversion Failed', status_span, progress, upload_error));
		});
	};

	function update_status (status_span, text) {
		status_span.html(text);
	}

	function handle_error (status_span, progress, error_span, err) {
		/*
		 * If, say, the 'get_presigned_url' fails, this handler will be called in 
		 * a cascade, but thankfully with null error parametes the subsequent times */
		if (!err)
			return;

		if (this)
			update_status (status_span, this);

		if (err && err.error_message)
			err = err.error_message;

		vanish_progress_bar (progress, err);
		mark_error (error_span, err);
	}

	function finish (status_span) {
		update_status (status_span, '');
	}

	function mark_error (error_span, err) {
		var err_str = (typeof err === 'object' ? 'Server Error' : err);

		log.error ('mark_error : err = ', err);
		error_span.html (err_str);
		error_span.css('display', 'block');
	}

	function clear_error (error_span) {
		error_span.html ('');
		error_span.css('display', 'none');
	}

	function upload_start (files, progress, status_span, data) {
		var _d = $.Deferred ();
		var file_obj = files[0];

		log.info ('upload_start : data = ', data);

		var xhr = new XMLHttpRequest();
		xhr.open ("PUT", data.upload_url);
		xhr.setRequestHeader('x-amz-acl', 'public-read');
		xhr.upload.addEventListener ("progress", update_progress.bind (null, progress));
		xhr.onload = function() {
			if (xhr.status !== 200) {
				_d.reject ('upload failed with status code ' + xhr.status);
				vanish_progress_bar (progress, xhr.status);
				return;
			}

			_d.resolve (data, file_obj);
			vanish_progress_bar (progress, null);
		};
		xhr.onerror = function(err) {
			log.error ('upload_start: err = ', err);
			update_status (status_span, 'Upload Failed');
			_d.reject(err);
		};
		xhr.send(file_obj);
		update_status (status_span, 'Uploading ...');

		return _d.promise ();
	}

	function init_progress_bar (progress) {
		progress.find('.progress-bar').removeClass('progress-bar-danger');
		progress.find('.progress-bar').removeClass('progress-bar-success');
		progress.find('.progress-bar').css('width', '0%');
		progress.fadeIn(500);
	}
	function vanish_progress_bar (progress, err) {
		progress.find('.progress-bar').addClass('progress-bar-' + (err ? 'danger' : 'success'));
		progress.find('.progress-bar').removeClass('progress-bar-' + (err ? 'success' : 'danger'));
		progress.fadeOut(500);
	}

	function update_progress (progress, evt) {
		if (evt.lengthComputable === true){
			var percentage_upload = (evt.loaded/evt.total)*100;
			progress.find('.progress-bar').css('width', parseInt (evt.loaded / evt.total * 100, 10) + '%');
		}
	}

	function upload_complete (files, anchor, status_span, data, file_obj){
		var _d = $.Deferred ();
		update_status (status_span, 'Finalizing upload ...');

		var key = 'upload_complete';
		var value = {
			name            : file_obj.name,
			path            : '/vctemp/'+ encodeURI(file_obj.name),
			type            : file_obj.type,
			size            : file_obj.size,
			url             : data.access_url,
			user_id         : 'arvind@authorgen.com',
			vc_id           : f_handle_cached.identity.vc_id,
			u_name          : f_handle_cached.identity.id,
			removeafter     : 3600,
			tags            : 'content, pdf'
		};

		anchor.find('.content-conversion-busy').css('display', 'block');
		f_handle_cached.send_command (null, key, value, 0)
		.then (
			function (arg) {
				_d.resolve (data, arg);
			},
			function (err) {
				_d.reject (err);
				update_status (status_span, 'Upload Complete Info Error.');
			}
		);

		return _d.promise ();
	}

	function start_conversion (email, files, anchor, status_span, data, file_obj){
		var _d = $.Deferred ();
		update_status (status_span, 'Processing ...');

		var key = 'start-conversion';
		var value = {
			name         	: file_obj.name,
			path	        : '/' + encodeURI (file_obj.name),
			type		    : file_obj.type,
			size      	    : file_obj.size,
			url             : data.access_url,
			user_id		    : email,
			vc_id 		    : f_handle_cached.identity.vc_id,
			u_name 		    : f_handle_cached.identity.id,
			tags		    : 'content, pdf'
		};

		anchor.find('.content-conversion-busy').css('display', 'block');
		f_handle_cached.send_command (null, key, value, 0)
			.then (
				function (arg) {
					_d.resolve (data, arg);
					update_status (status_span, 'Conversion Finished');
				},
				function (err) {
					_d.reject (err);
					update_status (status_span, 'Conversion Failed');
				}
			)
			.always (
				function () {
					anchor.find('.content-conversion-busy').css('display', 'none');
				}
			);

		return _d.promise ();
	}

	function inform_library (initial_data, data, other) {
		var _d = $.Deferred ();

		emitter.emit ('content-added', {
			tab           : initial_data.tab_anchor,
			name          : other.name,
			type          : other.type,
			created_at    : other.created_at,
			id            : other.id,
			raw_file_url  : data.access_url,
			conv_url      : other.url,
			thumbnail     : other.thumbnail
		});

		_d.resolve (data);

		return _d.promise ();
	}

	function init_handlers () {
	}

	function make_content_area_id (anchor_id) {
		return 'content-area-' + anchor_id	;
	}

	function get_presigned_url (email, file) {
		var key = 'get-tmp-url';
		var val = {
			path      : '/vctemp/' + encodeURI (file.name),
			name      : file.name,
			type      : file.type ? file.type : file.name.replace(/^.*\./g, ''),
			user_id   : email
		};

		log.info ('get_presigned_url: sending ', val);

		/*
		 * Send command to the session side couternpart */
		return f_handle_cached.send_command (null, key, val, 0);
	}

	return upload;

});
