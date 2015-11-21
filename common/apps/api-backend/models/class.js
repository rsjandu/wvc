var hashes   = require('jshashes');
var db       = require('api-backend/common/db');
var mylog    = require('api-backend/common/log').child({ module : 'models/class'});

var __class = {};
var class_schema;
var class_model;
var mongoose = db.mongoose;

/*
 * Initialize */
db.emitter.on('db-connected', function () {

	class_schema = create_schema ();
	class_model  = mongoose.model('class', class_schema);
});

function create_schema () {
	var Schema = mongoose.Schema;

	return new Schema ({
			class_id : { type : String, unique : true },
			time_spec : {
				starts : Date,
				duration : Number
			}
		});
}

function generate_class_id () {
	var seed_str = 'vc class id' + Date.now();
	return new hashes.SHA1().hex(seed_str);
}

__class.create = function (req, class_config, callback) {

	var class_doc = new class_model (class_config);

	class_doc.class_id = generate_class_id ();

	class_doc.save (function (err) {
		if (err) {
			req.log.error ({ err : err }, 'class config save error');
			return callback (err.errmsg, null);
		}
		req.log.info ({ class : class_doc }, 'class config saved ok');
		callback (null, class_doc);
	});
};

module.exports = __class;
