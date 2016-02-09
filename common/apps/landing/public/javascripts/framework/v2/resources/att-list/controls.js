/* 
 * an 'icon' in controlsbar represents on/off state of a control(aka key) */

define( function(require){
	var $ = require('jquery');

	var	log 	 	 = {},
		cache 		 = {},
		state 	 	 = {},				/* state of each control: initially 'undefined' then either 'set' or 'busy'. */
		controls 	 = {},
		attendee_api = {},
		my_namespace = '_att_skin';

	controls.init = function( api, logger){
		var _d = $.Deferred();
		
		log = logger;
		attendee_api = api;
		cache.elements = {}; 			/* we will cache element DOM objects */
		$('#atl-list').on('click', '.atl-control', control_clicked);
	
		_d.resolve();
		return _d.promise();
	};

	controls.change = function( vc_id, key, val){
		switch( state[vc_id+key]){
			case undefined:							/* initial state of the control */
				change_control( vc_id, key, val);	/* decides which icon to show (on/off) */
				change_state(vc_id,key);
				break;

			case 'set':
				change_control( vc_id, key, val);	/* seems like someone else changed the value of some control */
				break;

			case 'busy':							/* this must be the ack/nack to our req. */
				change_control( vc_id, key, val);	
				change_state(vc_id,key);
				break;		
		}
	};

	/*
	 * private methods */

	function control_clicked( evt){
		var $id = $(this).parent().parent().parent().find('.att_id');		/* there has to be a clean way to do this */
		if( !$id){
			log.info('warn:::user id not found...did someone change the user template?');
			return false; 
		}
	
		var vc_id = $id.html().replace( my_namespace, ''),
			ele   = $(this).attr('id'),
			key	  = ele.replace('-slashed','');
			val   = undefined;

		if( state[vc_id+key] == 'busy'){
			log.info('attempted to change while in \'busy\' state. Is a problem, control shouldn\'t be clickable');
			return false;
		}
		switch( ele){
			case 'microphone':
				val = 'false';
				break;
			case 'microphone-slashed':
				val = 'true';
				break;
			case 'camera':
				val = 'false';
				break;
			case 'camera-slashed':
				val = 'true';
				break;
			default:
				log.info( key + " clicked____and is not handled");
		}
		if( val){
			attendee_api.set_meta( vc_id, key, val, true);			/* 'true' tells it is a request */
			change_state(vc_id,key);
		}
		log.info(vc_id+ ' key: '+ key + ', to be val:'+val+', on_click');
	}
	
	function change_control( vc_id, key, val){
		/* set value */
		var _ele_on = _element(vc_id, key),
			_ele_off= _element(vc_id, key+'-slashed');
		( val) ? ( _ele_on.show().css('display','inline-block'), _ele_off.hide() )	: (	_ele_off.show().css('display','inline-block'), _ele_on.hide() );
	}

	function _element( vc_id, key){						
		/* 
		 * it is better to cache the searches here 
		 * instead of accessing the DOM everytime */
		var _ele = cache.elements[ vc_id + key];
		if( !_ele){
			/* because of limitations of listjs we need to use this dirty way */
			var temp = $('.att_id').filter( function(){	return this.innerHTML == vc_id+my_namespace	});
			if( temp)
				_ele = cache.elements[ vc_id + key] = temp.parent().find('#'+key);		/* assignment works right_to_left */
			else
				log.info('_element not found..smth is wrong with template and values');
		}

		return _ele;
	}

	function change_state( vc_id, key){
		/* allowed state changes are:
		 *		1. undefined ----> set
		 *		2. set		 ----> busy
		 *		3. busy 	 ----> set */
		var el = _element( vc_id, key+'-cover');
		switch( state[ vc_id+key]){
			case undefined:
			case 'busy':
				/* change to set */
				el.removeClass('cover-show'); 
				el.addClass('cover-hide'); 
				state[ vc_id+key] = 'set';
				break;

			case 'set':
				/* change to busy */
				el.removeClass('cover-hide');
				el.addClass('cover-show');
				state[ vc_id+key] = 'busy';
				break;

			default:
				log.info("element found in some unknown state");
				state[vc_id+key] = undefined;				/* what else can i do here */
		}
	}

	return controls;
});
