var model = require('auth/models/db');

controller = {};

controller.get_all = function (req, res, next) {
	model.get_all (credentials)
		.then (
			function (result) {
				res.status(200).send(result);
			},
			function (err) {
				res.status(500).send(err);
			}
		);
};

controller.add = function (req, res, next) {
	var credentials = req.body;

	model.add (credentials)
		.then (
			function (result) {
				res.status(200).send(result);
			},
			function (err) {
				res.status(500).send(err);
			}
		);
};

controller.remove = function (req, res, next) {
	var credentials = req.body;

	model.remove (credentials)
		.then (
			function (result) {
				res.status(200).send(result);
			},
			function (err) {
				res.status(500).send(err);
			}
		);
};

module.exports = controller;

