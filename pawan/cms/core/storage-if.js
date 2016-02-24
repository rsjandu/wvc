
var log	= require('common/log')  ,
	s3	= require('utils/s3')  ;
	/* require all others here */

var _if = {};

_if.get_upload_url = function( store_name, filename, cb ){
	var _s = {};

	log.info('_if::' + store_name + filename);
	switch( store_name){
		case 's3':
			_s = s3;
			break;
		default:
			cb( null, 'store name not valid');	
			return ;	
	}
	_s.get_upload_url( {'filename': filename})
	.then( cb, cb.bind(null) ) ;
};

module.exports = _if;
