var mongoose	= require('mongoose')  ;

var schema = mongoose.Schema({
	name	: { type: String },
	owner 	: { type: String, required : true },
	path	: { type: String, required : true },
	url		: { type: String, required : true }, 
	type	: { type: String, required : true },
	size	: { type: Number, required : true } ,
	ctime	: { type : Date, default : Date.now },
	tags	: [String],
	thumbnail: { type: String } 
});

schema.index({ owner : 1, path : 1 }, { unique : true });
module.exports = mongoose.model('node', schema);
