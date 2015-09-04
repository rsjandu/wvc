define(function(require) {
	var $ = require('jquery');
	var av = require('widget-av');
	var notify = require('notify')('framework');
	var framework = {};
	var layout = {};

	framework.init = function () {
		__probe_layout();
	};

	framework.insmod = function (_module) {
			var err = '';
			var _d = $.Deferred();

			if ((err = __attach_module(layout, _module)) !== null) {
				notify.warn('Failed to attach module ' + _module.name);
				_d.reject(err);
				return _d.promise();
			}

			var _d_mod = _module.handle.init (
								_module.resource.framework,
								_module.resource.custom,
								_module.resource.perms
						);

			_d_mod.then(
				function() { _d.resolve(_module); },
				_d.reject
			);

			return _d.promise();
	};

	/*---------------------------------------------
	 * Internal functions
	 *--------------------------------------------*/

	function __probe_layout () {

		if ($('#widget-top').length !== 0)
			layout.top = $('#widget-top')[0];

		if ($('#widget-notify').length !== 0)
			layout.notify = $('#widget-notify')[0];

		if ($('#widget-av').length !== 0)
			layout.av = $('#widget-av')[0];

		if ($('#widget-chat').length !== 0)
			layout.chat = $('#widget-chat')[0];

		if ($('#widget-tabs').length !== 0)
			layout.tabs = $('#widget-tabs')[0];

		if ($('#widget-side-left').length !== 0)
			layout.side_left = $('#widget-side-left')[0];

		if ($('#widget-side-right').length !== 0)
			layout.side_right = $('#widget-side-right')[0];
	}

	function __attach_module (layout, _module) {
		var widget = _module.resource.framework.widget;

		switch (widget) {
			case 'av' : return av.attach(layout.av, _module);
			default : 
				notify.warn('_module ' + _module.name + ' requesting non-existent widget ' + widget);
				return '_module ' + _module.name + ' requesting non-existent widget ' + widget;
		}
	}

	return framework;
});
