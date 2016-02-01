/* 
 *	read api_spec in docs 
 *	folder to know about 
 *	event handling (namespace, binder etc.).
 */

define(function(require){

	var _events = require('events'),
		widget 	= require('./widget');

	var evt_namespace = "framework:attendees",
		binder  	  = "att-list",
		listener 	  = {},
		log 		  = {};

	listener.init = function(logger){
		log = logger;
		_events.bind( evt_namespace, evt_handler, binder);
	};

	function evt_handler( evt, data){
		console.log('event received is :::::: ' + evt);	
		
		switch( evt){
			case 'in':
				user = data[0];
				widget.add_user( user);
				break;

			case 'out':
				widget.remove_user(data);
				break;

			default:
				log.info('unhandled event: ' + evt +' @atl');
		}	
	
	}

	return listener;
});
