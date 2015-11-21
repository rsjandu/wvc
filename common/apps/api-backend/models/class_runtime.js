var $        = require('jquery-deferred');
var moment   = require('moment');
var ERR      = require('common/error');
var hashes   = require('jshashes');
var db       = require('api-backend/common/db');
var mylog    = require('api-backend/common/log').child({ module : 'models/class-runtime'});

var runtime = {};
var class_schema;
var class_model;
var mongoose = db.mongoose;

/*
 * Initialize */
db.emitter.on('db-connected', function () {

	class_schema = create_schema ();
	class_model  = mongoose.model('class_instance', class_schema);
});

function create_schema () {
	var Schema = mongoose.Schema;

	return new Schema ({
			class_id : String,
			instance_id : { type : String, unique : true },
			current_state : String,
			times : {
				started : Date,
				instantiated : Date,
				ended : Date,
			},
		});
}

function generate_instance_id () {
	var seed_str = 'vc runtime' + Date.now();
	return new hashes.SHA1().hex(seed_str);
}

runtime.start = function (class_config_model) {
	var record = new class_model ({});

	record.class_id      = class_config_model.class_id;
	record.instance_id   = generate_instance_id ();
	record.current_state = 'starting';
	record.times.started = moment().utc().toISOString();

	record.save (function (err) {
		if (err) {
			mylog.error ({ err : err }, 'class runtime save error');
			return;
		}

		mylog.info ('class runtime saved ok');
		return;
	});

	return;
};

module.exports = runtime;
