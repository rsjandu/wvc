
var log	= require('common/log')  ,
	s3	= require('utils/s3')  ;
	/* require all others here */

var _if = {};

_if.get_upload_url = function( info, cb ){
	var _s = {};

	log.info('_if::' + info.store + info.path);
	switch( info.store){
		case 's3':
			_s = s3;
			break;
		default:
			cb( null, 'store name not valid');	
			return ;	
	}
	_s.get_upload_url( info)
	.then( cb.bind(null, null), cb) ;
};

module.exports = _if;
