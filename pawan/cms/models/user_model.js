var mongoose	= require('mongoose')  ;

var node = mongoose.Schema({
	name	: String,
	dir		: String,
	url		: String, 
	type	: String,
	size	: { type: Number}, // required : true } ,
	status	: String,
	ctime	: { type : Date, default : Date.now },
	tags	: [String]
},{ _id : false });

var schema = mongoose.Schema({
	uid 	: { type : String, unique : true },
	quota	: { type : Number, default : 10 } , //config.user.quota 
	nodes 	: [ node]
});

schema.methods.node_exists = function( dir , name ){		/* can not name a method the same as property */
	console.log( 'dir:' + dir + ' name:' + name);
	var arr = this.nodes ,
		len = arr.length ;
	while( len--){
		console.log('index:' + len + ' name:' + arr[len].name + ' dir:'+ arr[len].dir);
		if( arr[len].name === name && arr[len].dir === dir){
			return true;
		}
	}
	return false;
};

module.exports = mongoose.model('user', schema);
