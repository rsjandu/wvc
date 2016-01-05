define( function(require){
	var user_tpt 	= {};
	var widget_att 	= {};

	widget_att.init = function( anchor, templates, perms){
		var _d = $.Deferred();
		
		var wrapper_tpt = templates[0];
		$(anchor).append( wrapper_tpt() );
		
		user_tpt = templates[1];
		bootstrap_it_all();
		_d.resolve();
		return _d.promise();
	};

	widget_att.add_user = function(user){
		var _d = $.Deferred();

		/* make fit for template */
		user.name = user.name || user.displayName || "गुमनाम";
        user.avatar = user.avatar || "http://www.gravatar.com/avatar/?d=mm&s=40";
        user.options = user.options || ["some controls"];
		if( !user.vc_id){
			/* some error 
			 * as this id is used as elements id and 
			 * hence is required while removing li
			 */
		}

		var $ele = user_tpt(user);
		if( !$ele){
			/* log */
			console.log( 'template creation failed');
		}
		$('#atl-list').append( $ele);
		_d.resolve();
		return _d.promise();
	};

	function bootstrap_it_all(){
		$('.atl-wrapper').addClass('panel panel-primary');
		$('.atl-header').addClass('panel-heading');
		$('.atl-search').addClass('panel-heading');
		$('.atl-list-wrap').addClass('panel-body');
		
		$('#atl-list').addClass('list-group');
	}

	widget_att.remove_user = function(data){
		console.log('remove: '+ data );
		$('#' + data).remove();

	};

	return widget_att;
});
