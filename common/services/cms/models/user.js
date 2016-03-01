var mongoose	= require('mongoose')  ;

var schema = mongoose.Schema({
	uid 	: { type : String, unique : true },
	quota	: { type : Number, default : 1000 } , //config.user.quota 
	nodes 	: [ mongoose.Schema.Types.ObjectId]
});

module.exports = mongoose.model('user', schema);
