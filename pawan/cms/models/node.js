var mongoose	= require('mongoose')  ;

var schema = mongoose.Schema({
	owner 	: { type: String, required : true },
	name	: { type: String, required : true },
	dir		: { type: String, required : true },
	url		: { type: String, required : true }, 
	type	: { type: String, required : true },
	size	: { type: Number, required : true } ,
	ctime	: { type : Date, default : Date.now },
	tags	: [String]
});

module.exports = mongoose.model('node', schema);
