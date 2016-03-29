define(function(require) {
	var $           = require('jquery');
	window.jade     = require('jade');
	var log         = require('log')('content-player', 'info');
	var framework   = require('framework');
	var croco       = require('./crocodoc.viewer.min');

	var player = {};
	var f_handle_cached;
	var viewer_list = {};
	/*
	 * Use a hardcoded URI for now */
	var default_content_uri = "https://boxcontent.s3.amazonaws.com/9a99bc2a1dde42698e1e6bab105193ab";

	player.init = function (display_spec, custom, perms, f_handle) {
		f_handle_cached = f_handle;
		init_handlers ();
		return true;
	};

	player.start = function (anchor, content_uri, options) {
		var viewer;
		var anchor_id = $(anchor).attr('id');
		var _d = $.Deferred ();

		tab_set_mode($(anchor), 'loading');
		player.destroy ($(anchor));

		/*
		 * Load the player template */
		var template = f_handle_cached.template('player');
		var content_area_id = make_content_area_id (anchor_id);
		$(anchor).append(template({ 
			content_area_id   : content_area_id,
			content_uri       : content_uri,
			show_menu         : options.show_menu,
			shared            : options.shared && (options.shared ? 'yes' : 'no' )|| 'no'
		}));

		var content_area = $(anchor).find('.content-area');

		if (!content_uri) {
			log.error ('null content_uri');
			content_uri = default_content_uri;
		}

		viewer = Crocodoc.createViewer (content_area, { url: content_uri });
		viewer.load();
		viewer_list[content_area_id] = {
			handle : viewer
		};

		viewer.on('asseterror', function (ev) {
			log.error ('content asseterror  = ', ev);
			_d.reject (ev);
		});

		viewer.on('fail', function (ev) {
			log.error ('content failed to load  = ', ev);
			_d.reject (ev);
		});

		viewer.on('ready', function (ev) {
			log.info ('viewer ready : data = ', ev.data);

			try {
				/*
				 * This will sometimes throw an exception. Catch it and move on */
				viewer.setLayout(Crocodoc.LAYOUT_PRESENTATION);
			}
			catch (e) {
			}

			var mode = options.mode ? options.mode : 'fullview';
			tab_set_mode($(anchor), mode);

			try {
				log.info ('scrolling to ' + options.page);
				viewer.scrollTo (options.page || 1);
			}
			catch (e) {
				/* Ignore - some documents result in scroll errors */
				log.info ('unable to scroll [' + content_uri + ']: reason : ', e);
			}

			current_page = ev.data.page;
			var data = {
				current_page 	: current_page,
				total_pages	: ev.data.numPages
			};
			_d.resolve(data);
		});

		viewer.on('pagefocus', function (ev) {
			handle_page_focus ($(anchor), ev);
		});

		return _d.promise ();
	};

	player.destroy = function ($tab_anchor) {
		var $player = $tab_anchor.find('.content-player-outer');

		if ($player.length === 0)
			return;

		var content_area_id = $($player.find('ul.nav')[0]).attr('data-content-area-id');
		var viewer = get_viewer (content_area_id);

		destroy_viewer (content_area_id, viewer, $tab_anchor, false);

		if ($player.attr('data-is-shared') === 'yes') {
			var uuid = $tab_anchor.attr('data-tab-uuid');
			f_handle_cached.send_info ('*', 'content-destroyed', { uuid : uuid }, 0);
		}
	};

	player.navigate = function (anchor, info) {
		var content_area_id = $(anchor).find('.content-area').attr('id');
		var viewer = get_viewer (content_area_id);

		viewer.handle.scrollTo (info.page);
	};

	function make_content_area_id (anchor_id) {
		return 'content-area-' + anchor_id	;
	}

	function get_viewer (content_area_id) {
		var viewer = viewer_list[content_area_id];

		if (!viewer) {
			log.error ('no viewer found for content-area "' + content_area_id + '"');
			return null;
		}

		return viewer;
	}

	function init_handlers () {

		/*
		 * Handler for page navigation
		 */
		$('#widget-tabs').on('click', '.content-player-outer .content-menu ul li.content-page-nav', function (ev) {
			handle_page_navigation (ev);
		});

		/*
		 * Handlers for share
		 */
		$('#widget-tabs').on('click', '.content-player-outer .content-preview-menu ul li.content-share', function (ev) {
			handle_share (ev);
		});

		/*
		 * Handlers for preview moode
		 */
		$('#widget-tabs').on('click', '.content-player-outer .content-preview-menu ul li.content-preview-close', function (ev) {
			handle_preview_close (ev);
		});

		/*
		 * Handler to show library in the fullview
		 */
		$('#widget-tabs').on('click', '.content-player-outer .content-menu ul li.content-library', function (ev) {
			handle_show_library (ev);
		});
	}

	/*
	 * ----------------------------
	 * Page Navigation Handling
	 * ----------------------------
	 */
	function handle_page_navigation (ev) {
		var curr = $(ev.currentTarget);
		var content_area_id = curr.closest('ul').attr('data-content-area-id');
		var $content_area = curr.closest('.content-player-outer');
		var viewer = get_viewer (content_area_id);

		if (!viewer)
			return;

		var dir = curr.attr('data-nav-direction');
		dir = (dir === 'next' ? Crocodoc.SCROLL_NEXT : Crocodoc.SCROLL_PREVIOUS);
		viewer.handle.scrollTo (dir);

		/*
		 * This will eventually trigger "handle_page_focus" below */
	}

	function handle_page_focus ($tab_anchor, ev) {
		var $content_area = $tab_anchor.find('.content-player-outer');
		var current_page = ev.data.page;

		if ($content_area.attr('data-is-shared') === 'yes') {
			var uuid = $tab_anchor.attr('data-tab-uuid');

			var msg_data = {
				uuid : uuid,
				page : current_page
			};

			f_handle_cached.send_info ('*', 'navigate-to', msg_data, 0);
		}
	}

	/*
	 * ----------------------------
	 * Preview Close
	 * ----------------------------
	 */
	function handle_preview_close (ev) {
		var curr = $(ev.currentTarget);
		var content_area_id = curr.closest('ul').attr('data-content-area-id');
		var viewer = get_viewer (content_area_id);

		if (!viewer)
			return;

		destroy_viewer (content_area_id, viewer, curr.closest('.tab-pane'), true);
	}

	/*
	 * ----------------------------
	 * Show library
	 * ----------------------------
	 */
	function handle_show_library (ev) {
		var curr = $(ev.currentTarget);
		var $tab_anchor = curr.closest('.tab-pane');

		tab_set_mode ($tab_anchor, 'fullview-with-library');
	}

	/*
	 * ----------------------------
	 * Share
	 * ----------------------------
	 */
	function handle_share (ev) {
		var curr = $(ev.currentTarget);
		var $tab_anchor = curr.closest('.tab-pane');
		var uuid = $tab_anchor.attr('data-tab-uuid');
		var $content_area = curr.closest('.content-player-outer');

		/*
		 * Send a open tab message to all participants */
		var msg_data = {
			uuid         : $tab_anchor.attr('data-tab-uuid'),
			content_uri  : $content_area.attr('data-content-url')
		};

		f_handle_cached.send_info ('*', 'new-content', msg_data, 0);


		/*
		 * Instruct the framework to keep this tab in sync with it's remote counterparts */
		f_handle_cached.tabs.sync_remote ({ uuid : uuid });

		tab_set_mode ($tab_anchor, 'fullview');
		$content_area.attr('data-is-shared', 'yes');
	}

	function destroy_viewer (content_area_id, viewer, $tab_anchor, change_mode) {
		try {
			viewer.handle.destroy();
		}
		catch(e) {
			/* just continue - can't do much here */
			log.info ('crocodoc destroy viewer exception ', e);
		}

		delete viewer_list[content_area_id];

		$tab_anchor.find('.content-player-outer').empty();
		$tab_anchor.find('.content-player-outer').remove();

		if (change_mode)
			tab_set_mode ($tab_anchor, null);
	}

	var modes = { 
		'loading'               : true,
		'preview'               : true,
		'fullview'              : true,
		'fullview-with-library' : true
			/* and an un-named default view */
	};

	function tab_set_mode ($tab_anchor, mode) {
		if (mode)
			$tab_anchor.addClass('content-' + mode);

		/* Remove other classes */
		for (var _mode in modes) {
			if (_mode != mode)
				$tab_anchor.removeClass('content-' + _mode);
		}
	}

	return player;

});
