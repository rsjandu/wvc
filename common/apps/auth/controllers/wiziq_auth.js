var $         = require('jquery-deferred');
var cache     = require('common/cache').init('auth-gw', 4*60*60*1000);
var path      = require('path');

controller = {};

controller.show = function (req, res, next) {
	res.render('wiziq_auth.jade', { user: req.user });
};

module.exports = controller;

