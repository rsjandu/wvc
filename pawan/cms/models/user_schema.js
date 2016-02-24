var mongoose	= require('mongoose')  ;

var Schema = mongoose.Schema;

var schema = new Schema({
	user_id : { type : String, unique : true },

});

module.exports = schema;
