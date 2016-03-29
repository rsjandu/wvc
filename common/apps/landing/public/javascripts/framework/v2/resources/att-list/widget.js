define( function(require){

	var search = require('./search'),
		my_namespace= '_att_skin';	/* because we don't want an element with id=vc_id *
									 * what if some other resource has such an element and it does $('#vc_id').remove() */
	var user_tpt 	= {},
		widget_att 	= {},
		$anchor 	= {},
		log 		= {};

	widget_att.init = function( anchor, templates, identity, logger){
		var _d = $.Deferred();
	
		log = logger;	
		$anchor = $(anchor);			/* just search once */
		var wrapper_tpt = templates[0];
		format(identity);				/* make fit for template */
		$anchor.append( wrapper_tpt( identity) );
		$('#atl-search input').attr("placeholder",'No One To Search..');
		user_tpt = templates[1];
		
		_d.resolve();
		return _d.promise();
	};

	widget_att.add_user = function(user){
		var _d = $.Deferred();

		/* make fit for template */
		format( user);
		
		/*  
		 * user.vc_id is must for every user, 
		 * as this id is used as element id in our ul 
		 * and hence is required while removing li
		 */
		var $ele = user_tpt(user);
		if( !$ele){
			log.info('template creation failed');
		}

		$('#atl-list').append( $ele);		/* why is it hardcoded */
		search.update();

		_d.resolve();
		return _d.promise();
	};

	widget_att.toggle_visible = function(){
		$anchor.toggle();
		first && first.ack();		/* first time visible ack */
	};

	widget_att.remove_user = function( vc_id){
		$('#'+vc_id + my_namespace).remove();
		search.update();			// is it needed? 
	};

	function format( user){
		var avatar_def = "http://www.gravatar.com/avatar/?d=mm&s=40",
			t_join;

		if( user.history){
			var temp = $(user.history).get(-1);		/* get last joined ( the latest one) */
			
			temp ? (temp = temp.joined) : temp;
			var _d = new Date( temp),
				_h = _d.getHours(),
				_m = _d.getMinutes();
		
			_m = ( _m<10)? '0'+_m : _m;		/* zero padding */	
			t_join = _h + ':' + _m;
		}

		user.avatar = user.photos ? user.photos[0].value : avatar_def;
		user.time	= "Joined: " + (t_join || "---");
		user.email 	= user.emails ? user.emails[0].value  : "-----" ;
		user.authvia= user.authvia || "---";
		user.att_id = user.vc_id + my_namespace;
	}

	var first = {					/* things to be done after _first_user_join */
		ack : function(){
			require('./scroll').start( $('#atl-list-wrap') );		/* we allow scrolling with lower limit of one attendee  */	
			
			first = null;
		}	
	}
	
	return widget_att;
});
