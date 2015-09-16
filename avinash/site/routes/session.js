var express   = require('express');
var path      = require('path');
var config    = require('../config');
var log       = require('../common/log');
var templates = require('../controllers/templates');
var router    = express.Router();

router.use(function(req, res, next) {
	/*
	 * We'll somehow get the class/session config here
	 */
	var class_config = { 
			widgets: {
				layout: 'default',
				theme: 'early',
				top: {
					show: true,
				},
				notify: {
					show: true,
				},
			},
	};

	req.url = '/' + class_config.widgets.layout + req.url;
	req.class_config = class_config;

	next();
});

router.get('/default', function(req, res, next) {

	var dir = path.join(config.views, 'framework' + req.url + 'templates');

	templates.load(dir, function(err, _templates) {
		if (err)
			return next(err, req, res);

		res.render('framework/default/vc-frame',
				   { class_config: req.class_config,
					 _templates : _templates
				   });
	});
});

router.get('/default/config/get', function(req, res, next) {
	var session_config = { 
				resources : [
					{
						name: 'youtube',
						custom: {
							url: 'https://youtu.be/A18NJIybVlA'
						},
						framework: {
							widget: "av"
						},
						perms: {
						}
					},
					{
						name: 'notify-box',
						framework: {
							widget: 'notify',
						}
					}
				],
	};

	res.status(200).send(session_config);
});

module.exports = router;

