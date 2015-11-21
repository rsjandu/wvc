var $        = require('jquery-deferred');
var ERR      = require('common/error');
var hashes   = require('jshashes');
var db       = require('api-backend/common/db');
var mylog    = require('api-backend/common/log').child({ module : 'models/class-config'});

var config = {};
var class_schema;
var class_model;
var mongoose = db.mongoose;

/*
 * Initialize */
db.emitter.on('db-connected', function () {

	class_schema = create_schema ();
	class_model  = mongoose.model('class_config', class_schema);
});

function create_schema () {
	var Schema = mongoose.Schema;

	var schema = new Schema ({
			class_id : { type : String, unique : true },
			time_spec : {
				starts : Date,
				duration : Number
			},
			sched : {
				job_id : String
			}
		});

	return schema;
}

function generate_class_id () {
	var seed_str = 'vc class id' + Date.now();
	return new hashes.SHA1().hex(seed_str);
}

config.create = function (req, class_config) {
	var d = $.Deferred();
	var class_doc = new class_model (class_config);

	class_doc.class_id = generate_class_id ();

	class_doc.save (function (err) {
		if (err) {
			req.log.error ({ err : err }, 'class config save error');
			return d.reject (ERR.internal(err.errmsg));
		}

		req.log.info ({ class_doc : class_doc }, 'class config saved ok');
		d.resolve (class_doc);
	});

	return d.promise();
};

config.remove = function (req, class_doc) {
	var d = $.Deferred();

	class_doc.remove ({ class_id : class_doc.class_id }, function (err) {
		if (err) {
			req.log.error ({ err : err }, 'class config remove error');
			return d.reject (ERR.internal(err.errmsg));
		}

		req.log.info ({ class_id : class_doc.class_id }, 'class config removed ok');
		d.resolve (class_doc);
	});

	return d.promise();
};

config.get = {
	by_job_id : get.bind (null, 'job_id')
};

function get (field, value) {
	var d = $.Deferred();
	var query = {};

	query[field] = value;

	class_model.findOne (query, function (err, class_doc) {

		if (err) {
			req.log.error ({ err : err }, 'class get.by_' + field + ' error');
			return d.reject (ERR.internal(err.errmsg));
		}

		d.resolve (new class_model(class_doc));
	});

	return d.promise();
}

module.exports = config;
