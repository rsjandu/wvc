define( function(require){	
	/* 
	 * Store info of users ( identity as well as resource specific )
	 * API's for other modules to get and set data ( exported through framework )
	 * Skin will use these resources
	 * */

	var log 	= require('log')('attendees', 'info'),
		_events	= require('events');

	var store	= {}, 					/* vc_id : { identity : {}, meta : {}, rs_info : {} } */	
		att 	= {},
		people_ev = _events.emitter('framework:attendees', 'framework');


	att.fill_users = function( users){			/* to add users already present__before I joined */
		log.info ('fill_users:', users);
		if( users){
			users.forEach( function(user){
				add_to_map( user);
			});
		}
		/* should we emit some event here as well */
	};

	att.user_join = function( data){
		log.info('att.user_join called');
		add_to_map( data[0] );
		people_ev.emit('in', data);
		return;
	};
	
	att.user_leave = function( userId){
		log.info('att.user_leave called');
		if( store[ userId ] ){ 					
			store[ userId ].meta.isActive = false;		
		}
		else{
			log.warn('this needs attention: user who left was not in attendees store::' + user);
		}
		people_ev.emit('out',userId);
	};

	att.api = {

		get_identity : function( userId){
			return store[userId] ? store[userId].identity : null;
		},

		get_meta : function( userId){
			return store[userId] ? store[userId].meta : null;
		},

		get_users : function(){
			/* loop through store and return all the identities */
		},

	};

	/* 
	 * private methods
	 */

	function add_to_map( user){
		if( user){
			var id = user.vc_id;
			store[ id] = store [ id] || get_info_struct( user);
			store[ id].meta.isActive = true;
		}
		else{
			log.warn('user_join::: user is null');
		}
	}
	function get_info_struct( user){
		var info 	= {};
		info.identity 	= user;
		info.meta 		= {};			
		info.rs_info  	= {};
		return info;
	}

					
	/* 
	 * api for other modules
	 * */

	/* need to discuss this.. what needs to be done so that it improves our system n all */
	att.save_it_for_me = function( rname, userId, key, value, flag_push){	
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
		}*/
	};

	att.get_info = function( rname, userId, key){
		if( rname && userId && store[ userId] && store[userId].rs_info[rname]){
			return store[ userId].rs_info[rname][key];	
		}
		else{
			return null;
		}
	};

	return att;
});
