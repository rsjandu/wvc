define( function(require){	
	/* 
	 * Store info of users ( identity as well as resource specific )
	 * API's for other modules to get and set data ( exported through framework )
	 * Skin will use these resources
	 * */

	var log 	= require('log')('framework', 'info'),
		_events	= require('events');

	var store	= {}, 					/* vc_id : { identity : {}, meta : {}, rs_info : {} } */	
		att 	= {};

	_events.bind("framework:attendees", evt_handler, "attendees");	 	/* temporary handling */

	att.fill_users = function( users){			/* to add users already present__before I joined */
		users.forEach( function(user){
			att.user_join( user);
		});
	};

	att.user_join = function( user){
		var id = user.vc_id;
		store[ id] = store [ id] || get_info_struct( user);
		store[ id].meta.isActive = true;

		/* raise that event which framework is emitting for now */
		return;
	};
	
	att.user_leave = function( userId){
		if( store[ userId ] ){ 					
			store[ userId ].meta.isActive = false;		
		}
		else{
			log.warn('this needs attention: user who left was not in attendees store::' + user);		
		}
		/* tell others */
	};

	att.getUserInfo = function( userId){
		return store[userId] ? store[userId].identity : null;
	};

	att.getUsers = function(){
		/* loop through store and return all the identities */
	};
	
	
	/* 
	 * private methods
	 */

	function get_info_struct( user){
		var info 	= {};
		info.identity 	= user;
		info.meta 		= {};			
		info.rs_info  	= {};
		return info;
	}

	function evt_handler( evt, data){
		console.log('attendees::evt received ' + evt);
		
		switch( evt){
			case 'in':
				var user = data[0];
				att.user_join(user);
				break;
			case 'out':
				var uid = data;
				att.user_leave( uid);
				break;
			default:
				console.log('attendees::unknown event');
				break;
		}
	
	}
	
	/* 
	 * api for other modules
	 * */

	/* need to discuss this.. what needs to be done so that it improves our system n all */
	/* att.save_it_for_me = function( rname, userId, key, value, flag_push){	
		var is_res = store[ userId].rs_info[rname];

		if( !is_res){
			store[ userId].rs_info[rname] 	= {};
			store[ userId].rs_info[rname].key = value;
		}
		else{
			store[ userId].rs_info[rname][key] = value;
		}
			/* skip it for now
			is_key = store[ userId].rs_info[rname].key;
			if( !is_key || !flag_push){
				store[ userId].rs_info[rname][key] = value;
			}
			else{
				store[ userId].rs_info[rname][key].push( value);
			}
		}* /
	};

	att.getInfo = function(some_args_here){
		/* if present * /	
		return store[ userId].rs_info[rname][key];	
	};*/

	return att;
});
