var mongoose	= require('mongoose')  ;

var schema = mongoose.Schema({
	uid 	: { type : String, unique : true },
	quota	: { type : Number, default : 1000 } , //config.user.quota 
	nodes 	: [ mongoose.Schema.Types.ObjectId]
});

schema.methods.remove_node = function( id){
	var arr = this.nodes ,
		len = arr.length ;
	console.log('number of nodes: ' + len + ' id: ' + id );
	while( len--){
		console.log( arr[len]);
		if( arr[len].equals( id) ){
			console.log('len:: ' + len );
			delete arr[len];
			return true;
		}
	}	
	return false;
};

module.exports = mongoose.model('user', schema);
