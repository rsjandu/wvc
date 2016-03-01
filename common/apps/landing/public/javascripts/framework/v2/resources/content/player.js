define(function(require) {
	var $           = require('jquery');
	window.jade     = require('jade');
	var log         = require('log')('player', 'info');
	var framework   = require('framework');
	var croco       = require('./crocodoc.viewer.min');

	var player = {};
	var viewer;
	/*
	 * Use a hardcoded URI for now */
	var content_uri = "https://boxcontent.s3.amazonaws.com/9a99bc2a1dde42698e1e6bab105193ab";

	player.init = function (display_spec, custom, perms) {
		return true;
	};

	player.start = function (handle) {
		var anchor = handle.anchor;
		var _d = $.Deferred ();

		viewer = Crocodoc.createViewer(anchor, { url: content_uri });
		viewer.load();

		viewer.on('asseterror', function (ev) {
			log.error ('content asseterror  = ', ev);
			_d.reject (ev);
		});

		viewer.on('ready', function (ev) {
			log.info ('viewer ready : data = ', ev.data);

			viewer.setLayout(Crocodoc.LAYOUT_VERTICAL_SINGLE_COLUMN);
			current_page = ev.data.page;
			var data = {
				current_page 	: current_page,
				total_pages	: ev.data.numPages
			};
			_d.resolve(data);
		});

		viewer.on('resize', function(ev){
			console.log('Document width: ' + ev.data.width + ' heght: '+ev.data.height );
		});

		viewer.on('zoom',function(ev){
			zoomVal = ev.data.zoom;
		});

		viewer.on('pagefocus', function(evt){
			current_page = evt.data.page;
			$('#pageInput').val(current_page);
		});

		return _d.promise ();
	};

	return player;

});
