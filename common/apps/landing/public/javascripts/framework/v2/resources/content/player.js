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

	player.start = function (anchor, content_uri, mode) {
		var viewer;
		var anchor_id = $(anchor).attr('id');
		var _d = $.Deferred ();

		close_previous_viewer ($(anchor));
		tab_set_mode($(anchor), 'loading');

		/*
		 * Load the player template */
		var template = f_handle_cached.template('player');
		var content_area_id = make_content_area_id (anchor_id);
		$(anchor).append(template({ 
			content_area_id : content_area_id,
			mode            : mode ? mode : ''
		}));

		var content_area = $(anchor).find('.content-area');

		if (!content_uri)
			content_uri = default_content_uri;

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
				viewer.setLayout(Crocodoc.LAYOUT_VERTICAL_SINGLE_COLUMN);
			}
			catch (e) {
			}

			/* add a class to the main tab container */
			tab_set_mode ($(anchor), mode);

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

	function make_content_area_id (anchor_id) {
		return 'content-area-' + anchor_id	;
	}

	function get_viewer_from_ul ($ul) {
		var content_area_id = $ul.attr('data-content-area-id');
		var viewer = viewer_list[content_area_id];

		if (!viewer) {
			log.error ('no viewer found for content-area "' + content_area_id + '"');
			return null;
		}

		return viewer;
	}

	function init_handlers () {

		/*
		 * Handler to change layout
		 */
		$('#widget-tabs').on('click', '.content-player-outer .content-menu ul li.content-layout-toggle', function (ev) {
			handle_layout_change (ev);
		});

		/*
		 * Handler for page navigation
		 */
		$('#widget-tabs').on('click', '.content-player-outer .content-menu ul li.content-page-nav', function (ev) {
			handle_page_navigation (ev);
		});

		/*
		 * Handlers for preview moode
		 */
		$('#widget-tabs').on('click', '.content-player-outer .content-preview-menu ul li.content-preview-close', function (ev) {
			handle_preview_close (ev);
		});
	}

	/*
	 * ----------------------------
	 * Layout Handling
	 * ----------------------------
	 */
	var layouts = [
		{ layout : Crocodoc.LAYOUT_VERTICAL_SINGLE_COLUMN, tooltip : 'Vertical, Single Column, Scrollable' },
		{ layout : Crocodoc.LAYOUT_HORIZONTAL,             tooltip : 'Horizontal, Single Row, Scrollable' },
		{ layout : Crocodoc.LAYOUT_PRESENTATION,           tooltip : 'Presentation, One page at a time' },
		{ layout : Crocodoc.LAYOUT_PRESENTATION_TWO_PAGE,  tooltip : 'Presentation, Two pages at a time' }
	];
	var curr_layout_index = 0;

	function handle_layout_change (ev) {
		var curr = $(ev.currentTarget);
		var $ul = curr.closest('ul');
		var viewer = get_viewer_from_ul ($ul);

		if (!viewer)
			return;

		curr_layout_index = (curr_layout_index + 1) % (layouts.length);
		viewer.handle.setLayout (layouts[curr_layout_index].layout);

		/* Change tooltip */
		curr.find('span.tooltip-text').html(layouts[curr_layout_index].tooltip);
	}

	/*
	 * ----------------------------
	 * Page Navigation Handling
	 * ----------------------------
	 */
	function handle_page_navigation (ev) {
		var curr = $(ev.currentTarget);
		var $ul = curr.closest('ul');
		var viewer = get_viewer_from_ul ($ul);

		if (!viewer)
			return;

		var dir = curr.attr('data-nav-direction');
		viewer.handle.scrollTo (dir === 'next' ? Crocodoc.SCROLL_NEXT : Crocodoc.SCROLL_PREVIOUS);
	}

	/*
	 * ----------------------------
	 * Preview Close
	 * ----------------------------
	 */
	function handle_preview_close (ev) {
		var curr = $(ev.currentTarget);
		var $ul = curr.closest('ul');
		var viewer = get_viewer_from_ul ($ul);

		if (!viewer)
			return;

		destroy_viewer (viewer, curr.closest('.tab-pane'));
	}

	function destroy_viewer (viewer, $tab_anchor) {
		try {
			viewer.handle.destroy();
		}
		catch(e) {
			/* just continue - can't do much here */
			log.info ('crocodoc destroy viewer exception ', e);
		}

		$tab_anchor.find('.content-player-outer').empty();
		$tab_anchor.find('.content-player-outer').remove();

		tab_set_mode ($tab_anchor, null);
	}

	function close_previous_viewer ($tab_anchor) {
		var $player = $tab_anchor.find('.content-player-outer');

		if ($player.length === 0)
			return;

		var $ul = $($player.find('ul.nav')[0]);
		var viewer = get_viewer_from_ul ($ul);

		destroy_viewer (viewer, $tab_anchor);
	}

	var modes = { 
		'loading' : true,
		'preview' : true,
		'view' : true
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
