var $            = require('jquery-deferred');
var ERR          = require('common/error');
var c_config     = require('api-backend/models/class_config');
var sched        = require('api-backend/models/sched');
var mylog        = require('api-backend/common/log').child({ module : 'controllers/class'});

var controller = {};

controller.create = function (req, res, next) {
	var err;
	var class_config = req.body;

	err = validate_params (class_config);
	if (err)
		return send_error.bind(res, req, ERR.bad_request(err));

	c_config.create(req, class_config)
		/* ok */
		.then (
			function (doc) {
				var job_id = sched.schedule (
						req, 
						class_config.time_spec.starts, 
						class_config.time_spec.duration, 
						fire_class);

				if (!job_id) {
					class_config.remove(req, doc);
					return send_error.call(res, req, ERR.bad_request('incorrect class parameters'));
				}

				/* All ij well */
				return res.send(doc);
			},
			/* fail */
			send_error.bind(res, req)
		);
};

function validate_params (class_config) {
	return null;
}

controller.update = function (req, res, next) {
};

controller.remove = function (req, res, next) {
};

function fire_class (job_id, which_timer) {
	mylog.info ({ job : {
		job_id : job_id,
		now    : (new Date()).toISOString(),
		which  : which_timer
	}}, 'Class timer fired');
}

function send_error (req, err) {
	/*
	 * 'err' is custom error, always */
	var status = 500;

	if (!err.status)
		req.log.error ('no type set in error');
	else
		status = err.status;
	mylog.warn ({ status: status });

	this.status(status).send(err.message);
}

module.exports = controller;
