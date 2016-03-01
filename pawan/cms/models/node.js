var mongoose	= require('mongoose')  ;

var schema = mongoose.Schema({
	host 	: String,
	name	: String,
	dir		: String,
	url		: String, 
	type	: String,
	size	: { type: Number}, // required : true } ,
	status	: String,
	ctime	: { type : Date, default : Date.now },
	tags	: [String]
});

module.exports = mongoose.model('node', schema);
