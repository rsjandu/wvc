define( function(require){
	var search 		= require('./search');

	var my_namespace= '@att_skin';	/* because we don't want an element with id=vc_id *
									 * what if some other resource has such an element and it does $('#vc_id').remove() */
	var user_tpt 	= {};
	var widget_att 	= {};
	var $anchor 	= {};

	widget_att.init = function( anchor, templates, perms){
		var _d = $.Deferred();
		
		$anchor = $(anchor);			/* just search once */
		var wrapper_tpt = templates[0];
		$anchor.append( wrapper_tpt() );
		
		user_tpt = templates[1];
		
		_d.resolve();
		return _d.promise();
	};

	var first_user = true;
	widget_att.add_user = function(user){
		var _d = $.Deferred();

		/* make fit for template */
		var avatar_def = "http://www.gravatar.com/avatar/?d=mm&s=40";
		user.avatar = user.photos ? user.photos[0].value : avatar_def;
		user.time	= user.vc_auth_ts || "0";
		user.email 	= user.emails ? user.emails[0].value  : "default@wvc.dev" ;
		user.authvia= user.authvia || "Auth";
		user.options = ['/landing/images/vu-meter.png', '/landing/images/vu-meter.png'];
		
		user.att_id = user.vc_id + my_namespace;

		/*  
		 * user.vc_id is must for every user, 
		 * as this id is used as element id in our ul 
		 * and hence is required while removing li
		 */
		if( first_user){
			var $ele = user_tpt(user);
			if( !$ele){
				/* log */
				console.log( 'template creation failed');
			}

			$('#atl-list').append( $ele);		/* why is it hardcoded */
			search.init(); 
			first_user = false; 
		} 
		else { 
			search.add( user);
		}
		
		_d.resolve();
		return _d.promise();
	};

	widget_att.toggle_visible = function(){
		$anchor.toggle();	/* but where's the sliding wala effect */
	};

	widget_att.remove_user = function(data){
		console.log('remove: '+ data );
		search.remove( data + my_namespace);
	};

	return widget_att;
});
