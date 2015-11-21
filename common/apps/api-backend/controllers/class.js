var _class = require('api-backend/models/class');
var mod = {};

mod.create = function (req, res, next) {
	var err;
	var class_config = req.body;

	err = validate_params (class_config);
	if (err)
		return res.status (400).send(err);

	_class.create(req, class_config, function (error, result) {
		if (error)
			return res.status(400).send(error);

		res.status(200).send(result);
	});
};

function validate_params (class_config) {
	return null;
}

mod.update = function (req, res, next) {
};

mod.remove = function (req, res, next) {
};

module.exports = mod;
