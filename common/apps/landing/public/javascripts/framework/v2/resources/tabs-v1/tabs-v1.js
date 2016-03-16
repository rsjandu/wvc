define(function(require) {
	var $           = require('jquery');
	window.jade     = require('jade');
	var modernizer  = require('modernizer');
	var log         = require('log')('tabs-v1', 'info');
	var framework   = require('framework');
	var bootstrap   = require('bootstrap');

	var tabs = {};
	var f_handle = framework.handle ('tabs-v1');
	var anchor, dropdown_menu, ul_top, content_top;
	var apps = {};

	tabs.init = function (display_spec, custom, perms) {
		var t_name = "tabs";
		var _d = $.Deferred();

		anchor = display_spec.anchor;
		var template = f_handle.template(t_name);

		if (!template) {
			_d.reject ('tabs-v1: template "' + t_name + '" not found');
			return _d.promise ();
		}

		$(anchor).append (template ());
		dropdown_menu = $(anchor).find('ul.dropdown-menu');
		ul_top        = $(anchor).find('ul.nav.nav-tabs');
		content_top   = $(anchor).find('div.tab-content');

		init_handlers ();

		_d.resolve();
		return _d.promise();
	};

	/*
	 * Any resource, acting as a 'tab-contrller', must provide this
	 * method to the framework, so that other users of the tabs
	 * can register themselves to this resource. */
	tabs.register = function (mod_name, mod_resource, methods) {

		apps[mod_name] = {
			methods : methods,
			resource : mod_resource
		};

		/* Add the module in the dropdown menu */
		add_to_dropdown_menu (mod_name, mod_resource);

		return null;
	};

	tabs.start = function (sess_info) {
	};

	var id_seed = 0;
	tabs.create = function (module_name, options) {
		var id = module_name + id_seed;
		var display_name = (options.display_name ? options.display_name : module_name + '(' + id_seed + ')');

		id_seed++;

		/*
		 * Create the li element */
		ul_top.find('li.active').removeClass('active');
		content_top.find('div.active').removeClass('active');
		ul_top.append (
			'<li role="presentation" class="active"><a href="#' + id + '" aria-controls="' + id + '" role="tab" data-toggle="tab">' + display_name + '</a></li>'
		);

		/*
		 * Create the tab element */
		content_top.append (
			'<div role="tabpanel" class="tab-pane active fade in" id="' + id + '" data-tab-uuid="' + options.uuid + '"></div>'
		);

		var res = {
			anchor : content_top.find('div.tab-pane#' + id)[0],
			id     : id,
			uuid   : options.uuid
		};

		ul_top.find('li a#' + id).tab('show');

		return res;
	};

	function init_handlers () {
		dropdown_menu.on('click', 'a', function (ev) {
			var target = $(ev.currentTarget).attr('href');
			var mod_name = target.replace(/^#tab-menu-/g, '');

			if (apps[mod_name] && apps[mod_name].methods)
				apps[mod_name].methods.create();
		});

		/*
		ul_top.on('click', 'a', function (e) {
			log.info ('showing ', e.target);
		});
		ul_top.on('shown.bs.tab', 'a', function (e) {
			log.info ('showing ', e.target);
		});
	   */
	}

	function add_to_dropdown_menu (mod_name, mod_resource) {
		dropdown_menu.append('<li>' + 
							 	'<a href="#tab-menu-' + mod_name + '">' + mod_name + '</a>' +
							 '</li>');
	}

	return tabs;

});
