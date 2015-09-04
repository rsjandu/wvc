var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	/*
	 * We'll somehow get the class/session config here
	 */
	var class_config = { 
			widgets: {
				top: {
					show: true,
				},
				notify: {
					show: true,
				},
			},
	};

	res.render('framework/vc-frame', class_config);
});

router.get('/config/get', function(req, res, next) {
	var session_config = { 
				resources : [
					{
						name: 'youtube',
					},
					{
						name: 'chat',
					},
				],
	};

	res.status(200).send(session_config);
});

module.exports = router;

