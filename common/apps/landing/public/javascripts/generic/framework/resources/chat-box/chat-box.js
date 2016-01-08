/* The time has come to break the code in modules */

define(function(require){
	var $ = require('jquery');
	var moment = require('./moment.min');
	var events = require('events');
	var log = require('log')('lets-chat', 'info');
	var framework = require('framework');

	var chat_box = {};
	var anchor = {};
	var f_handle = framework.handle('chat-box');
	var my_info = {};
	var msgTemplate = {};
	var room_id = {};
	var me = {};
	var scroll_lock = false;
	/*
	 * create connection
	 * join room
	 * and do your stuff
	 */

	chat_box.init = function (display_spec, custom, perms) {
			var _d = $.Deferred();

			log.info ('chat_box init called');

			anchor = display_spec.anchor;
			var templates = display_spec.templates;
			var template  = f_handle.template( templates[0] );
			msgTemplate   = f_handle.template( templates[1] );

			if(!template || !msgTemplate){
				_d.reject ('chat-box: some template not found' );
			}

			var $room = template();
			$(anchor).append( $room);
			$('.lcb-entry-button').on('click', sendMessage);
			$('.lcb-entry-input').on('keypress',sendMessage);
			$('.lcb-messages-container').scroll( scrollHandler );
			/* make the text area uneditable, untill the connection is made(with the chat server) */
		 	$('.lcb-entry-input').attr("placeholder","Connecting To Chat...").prop('disabled', true);

			events.bind('framework:layout', layout_changed, 'chat-box');
			$('#widget-chat .lcb-room-header svg').on('click', handle_click);

			_d.resolve();
			return _d.promise();
	};
	chat_box.start = function (sess_info) {
		log.info ('chat box Stuff = ', sess_info);
		if (!sess_info) {
			log.error ('no session info !');
			return;
		}

		my_info = sess_info;

		/*  token, to be used as auth-token when communicating */
		my_token = sess_info.token;

		connect(sess_info)
		.then(
			function( sock){
				socket = sock;

				socket.on('connect', function(){
					log.info('connect','done');
				});
				socket.on('reconnect',function(){
					log.info('reconnect done');
				});
				socket.on('error', function(err){
					log.error('Connection to server ' + sess_info.root_url + ' failed. Data = ', err);
				});
				/* add event listeners for reconnect, reconnecting, error */
				socket.on('messages:new', function(data){ log.info('received message:', data);  append_message(data); });
				socket.on('messages:typing', function(data){ log.info('received typing notif: ', data); typing_handler(data.owner, data.room); });
				socket.on('messages:ntyping', function(data){ log.info('received ntyping notif: ', data); ntyping_handler(data.owner, data.room); });

				socket = sock;
				room_id = sess_info.room_id;
				who_am_i();
				join_room(room_id);
			});
	};

	/*
	 * private methods
	 */

	function connect( sess_info ){
		var _d = $.Deferred();
		log.info('logging','in');

		require([sess_info.root_url + '/socket.io/socket.io.js'],function( io){

			var sock = io.connect(
				sess_info.root_url,
				{
					query : 'token=' + my_token
				});
			_d.resolve( sock);
		});
		return _d.promise();
	}

	function who_am_i(){
		socket.emit('account:whoami',function(user){
			me = user;
		});
	}

	function join_room( room_id ){
		log.info('connecting to', room_id);
		//check if soket is null
		socket.emit('rooms:join', { roomId : room_id, password : ''}, function(resRoom){
			var room = resRoom; 											/* Canbe made global in place of room-id */
			log.info('connected ', room);
			/* here we get the actual data about room  so better add template here*/
		 	$('.lcb-entry-input').attr("placeholder","Got Something To Say?").prop('disabled', false);

			/* consider the case of reconnection..duplicate messages should not be allowed */
			get_messages(room_id);
		});
	}

	function get_messages( room_id ){
		socket.emit('messages:list',{
			room 		: room_id,
			//since_id 	: 1,
			take		: 10,
			expand		: 'owner, room',
			reverse		: true			//what does this mean
		},function( messages){
			log.info('received_messsages', messages);
			scroll_lock = false;
			for(var i= messages.length-1; i>=0; i--){
				append_message (messages[i] );
			}
		});
	}
	function sendMessage(e){
		if(e.type === 'keypress' && e.keyCode !== 13 || e.altKey){
			notify_typing();
			return;
		}
		if(e.type === 'keypress' && e.keyCode === 13 && e.shiftKey){
			notify_typing();
			/*
			 * shift+enter let u send multi line messages
			 * 	this is what sets the paste option
			 * 	on receive handle them differently (use pre tag)
			 */
			return;
		}
		e.preventDefault();


		var $textarea = $('.lcb-entry-input');
		if(!$textarea.val())
			return;

		send_message( $textarea.val() );
		stop_typing();
		$textarea.val('');
	}

	function send_message( message ){
		socket.emit( 'messages:create',{ 'room' : my_info.room_id, 'text' :  message });
	}

	var lastMessageOwner = {};
	function append_message( messageObj ){
		/* The case of shift+enter, multi line message */
		messageObj.paste=  /\n/i.test(messageObj.text);

		/* fragement or new message */
		messageObj.fragment = lastMessageOwner === messageObj.owner.id;
		messageObj.time = moment(messageObj.posted).calendar();
		messageObj.classs = (messageObj.owner.id === me.id)? "lcb-message-own" : "lcb-message swatch-" + color_manager.my_color( messageObj.owner.id );
		if (messageObj.fragment)
			messageObj.classs += " lcb-fragment";

		var $message = msgTemplate( messageObj);


		$messages = $('.lcb-messages');
		$messages.append(/*'<li>' +*/ $message);

		if( !messageObj.fragment){
			lastMessageOwner = messageObj.owner.id;
		}

		if( scroll_lock === false || messageObj.owner.id === me.id ){
			scrollTo( $messages[0] );
		}
	}

	/* different colors for different users */
	var color_manager = {
		colors 			: [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
		index  			: 0, 
		get_next_color 	: function(){
									var temp = this.index;
									index = (++this.index) % this.colors.length;
									return this.colors[ temp ];	
						  },
		colorOf 		: {},			/* map of userid : color */
		my_color 		: function( id){
								var color = this.colorOf[id];
								if( !color){
									color = this.colorOf[ id] = this.get_next_color();
								}	
								return color;
						  }
	};

  /* typing notification related */
	
  /* typing notifs sending related */

	var timer_notif = null;
	var after_tpevt_expired = 5000;		/*  */
	function notify_typing(){
		if( !timer_notif ){
			start_typing();
		}
		else{
			update_typing();
		}
	}

	function start_typing(){
		socket.emit('messages:typing', { 'room' : my_info.room_id } );
		/* add timer  */
		timer_notif =	setTimeout( stop_typing, after_tpevt_expired);
	}

	function update_typing(){
		/* reset timer */
		clearTimeout(timer_notif);
		timer_notif = setTimeout( stop_typing, after_tpevt_expired);
	}

	function stop_typing(){
		socket.emit('messages:ntyping', { 'room' : my_info.room_id });
		/* clear timeout if still exists */
		timer_notif = null;	
	}

  /* typing event receive events */
	var users_typing = [];
	function typing_handler(user, room){
		log.info(user.displayName+ ' is typing in the room: ' + room);

		if( user.id === me.id){
			log.info( 'this is me.. typing');
			return;
		}
		/* has just started or was already typing */
		if( !(user in users_typing ) ){
			users_typing.push(user);
		}
		else{
			/* maybe move that entry to front or smth
			 *
			 * but 1st see if it is possible or not
			*/
		}
		update_notification();
	}
	function ntyping_handler(user, room){
		log.info(user.displayName + 'is typing no more' + room);
		if( arr_del(users_typing, user) ){
			update_notification();
		}
	}

	function arr_del(a, obj) { 	/* check if array contains */
	    var i = a.length;
	    while (i--) {
		       if (a[i].id === obj.id) {
				   		a.splice(i,1);
			              return true;
			          }
		    }
	    return false;
	}
	function update_notification(){
		/* count keys in object */
		var len = Object.keys( users_typing ).length;
		if(!len){
			/* clear notification area */
			$('.lcb-notification-bar').html('');
			log.info('no one is typing');
			return;
		}
		var notif =  [];
		notif.push(users_typing[0].displayName) ;
		switch( len ){
			case 1:
				notif.push( 'is');
				break;
			case 2:
				notif.push( 'and ' +  users_typing[1].displayName  + ' are' );
				break;
			default:
				notif.push( ', ' 	+ users_typing[1].displayName  + ' and ' + (len-2).toString() + ' others are');
		}
		notif.push( 'typing...');
		notif = notif.join(' ');		/* avoids extra string objs and executes faster than '+' */
		log.info( notif );
		/* fill notification area */
		$('.lcb-notification-bar').html(notif);
	}
	

	/* auto-scroll related */

	function scrollHandler(){
		var msg_container = $('.lcb-messages-container')[0];
		var scrHeight  	= msg_container.scrollHeight;
		console.log( scrHeight );
		var scrTop 		= msg_container.scrollTop;
		var clientHeight= msg_container.clientHeight;
		if( scrTop === scrHeight - clientHeight ){
			scroll_lock = false;
		}
		else{
			scroll_lock = true;
		}
	}

	function scrollTo( $messages ){
    	//messages.scrollTop =  messages.scrollHeight ;
		$('.lcb-messages-container').scrollTop( $messages.scrollHeight );
	}

	log.info ('notify_box loaded');

	var current_layout;

	function layout_changed (ev, data) {
		/* Just note the current layout for now */
		current_layout = ev;
		if (current_layout != 'av-fullscreen')
			$('#widget-chat').removeClass('chat-visible');
		return;
	}

	/* This variable indicates the visibility of the chat widget in av-fullscreen
	 * layout _ONLY_. So, by default it is false, since the chat widget is not 
	 * visible in that layout */
	var am_i_visible = false;

	function handle_click (ev) {
		log.info ('chat-box: myicon clicked');
		if (current_layout && current_layout === 'av-fullscreen') {

			if (!am_i_visible) {
				$('#widget-chat').addClass('chat-visible');
				am_i_visible = true;
			}
			else {
				$('#widget-chat').removeClass('chat-visible');
				am_i_visible = false;
			}
		}

		ev.preventDefault();
		return;
	}

	return chat_box;
});
