define( function(require){
	var $ = require('jquery');

	var $base 	 = {},
		controls = {},
		log 	 = {};

	controls.init = function( logger){
		var _d = $.Deferred();
		
		log = logger;
		$('#atl-list').on('click', '.atl-control', control_clicked);
	
		_d.resolve();
		return _d.promise();
	};

	function control_clicked( evt){
		var $id = $(this).parent().parent().parent().find('.att_id');		/* there has to be a clean way to do this */
		if( $id)
			log.info('user id control_clicked::: ' + $id.html() );
	
		var ele_id = $(this).attr('id');
		switch( ele_id){
			case 'mic':
				log.info('mic clicked');
				break;
			case 'mic-slashed':
				log.info('mic muted, clicked');
				break;
			case 'camera':
				log.info('cam clicked');
				break;
			case 'camera-slashed':
				log.info('cam off, clicked');
				break;
			default:
				log.info( ele_id + " clicked____and is not handled");
		}
	}

	return controls;
});
