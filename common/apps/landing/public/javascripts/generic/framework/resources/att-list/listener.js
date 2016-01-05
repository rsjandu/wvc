/* 
 *	read api_spec in docs 
 *	folder to know about 
 *	event handling (namespace, binder etc.).
 */

define(function(require){

	var _events = require('events');
	var widget 	= require('./widget');

	var evt_namespace = "framework:attendees";
	var binder  = "att-list";
	var listener = {};

	listener.init = function(){
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
//				log.warn('unhandled event: ' + evt +' @atl');
		}	
	
	}

	return listener;
});
