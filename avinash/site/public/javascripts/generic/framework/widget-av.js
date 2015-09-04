define(function(require) {
	var $ = require('jquery');
	var notify = require('notify')('widget-av');
	var av = {};
	var _module = null;

	av.attach = function (anchor, _module) {
		if (!_module) {
			notify.error ('Can\'t attach _module:', _module.name, ':', _module.name, 'already attached');
			return 'already attached';
		}

		_module.resource.framework.anchor = $(anchor).find('.main-inner')[0];

		/*
		 * TODO:
		 * 	If the _module has a template, then attach it under the anchor
		 */

		notify.info('all eej well')
		return null;
	};

	return av;
});

