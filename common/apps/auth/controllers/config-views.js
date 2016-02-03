controller = {};

controller.show = function (req, res, next) {
	res.render('config_show.jade', { user: req.user });
};

controller.add = function (req, res, next) {
	res.render('config_add.jade', { user: req.user });
};

controller.delete = function (req, res, next) {
	res.render('config_delete.jade', { user: req.user });
};

module.exports = controller;

