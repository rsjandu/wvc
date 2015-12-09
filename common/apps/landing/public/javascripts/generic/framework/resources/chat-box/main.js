/* The time has come to break the code in modules */

define(function(require){
	var $ = require('jquery');
	var moment = require('./moment.min');
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
				socket.on('messages:typing', function(data){ log.info('received typing notif: ', data); typing_handler(data.owner, data.room) });

				socket = sock;
				room_id = sess_info.room_id;
				who_am_i();
				join_room(room_id);
			});
	};

	/*
	 * private methods
	 */

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
	var users_typing = {};
	var interval = 5000;			/*kept to half a minute for now.. actual is to be decided */
	var send_interval = interval - 1000;
	var t_uid = {};
	/*
	 * timers : one for my send, and one for each user typing
	 * a typing event can be sent after an 'interval' only. Sent after a keypress in textArea
	 * timer is cleared: when message is sent, when a message is received from some user who was typing
	 * timer is reset  : when another typing event received from a user typing
	 */
	function typing_handler(user, room){
		log.info(user.displayName+ ' is typing in the room: ' + room);

		if( user.id === me.id){
			log.info( 'this is me.. typing');
			return;
		}
		/* has just started or was already typing */
		if( !(user.id in users_typing ) ){
			update_last_two(user);
			users_typing[user.id] = setTimeout( remove_user_typing, interval, user.id );
		//	update_notification(); /* always shows [last 2] and [list.length-2] others are typing */
		}
		else{
			clearTimeout( users_typing[user.id] );
			update_last_two( user);
			users_typing[user.id] = setTimeout( remove_user_typing, interval, user.id );
		}
		update_notification();
	}
	function update_last_two( user ){
		if( t_uid.first == user.displayName)
			return;
		t_uid.second 	=	 t_uid.first;
		t_uid.first 	= 	 user.displayName;
	}
	function remove_user_typing( userId){		/* currently fired at timeout. On fire at receive message timer should be cleared */
		log.info( userId + ' not typing anymore')
		if( userId in users_typing ){
//			clearTimeout( users_typing[userId] );  /* case of receive message */
			delete users_typing[userId];
			update_notification();
		}
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
		var notif =  t_uid.first ;
		switch( len ){
			case 1:
				notif += ' is';
				break;
			case 2:
				notif += ' and ' +  t_uid.second  + ' are';
				break;
			default:
				notif += ', ' 	+ t_uid.second  + ' and ' + (len-2).toString() + ' others are';
		}
		notif += ' typing...';
		log.info( notif );
		/* fill notification area */
		$('.lcb-notification-bar').html(notif);
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
	var timer = null;
	function notify_typing(){
		if( !timer){
			/* send event */
			log.info('sent message typing event');
			socket.emit('messages:typing', { 'room' : my_info.room_id } );
			/* add timer  */
			timer =	setTimeout( send_timer_timeout, send_interval);
		}
		return;
	}
	function send_timer_timeout(){
		timer = null;
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
		send_timer_timeout();
		$textarea.val('');
	}

	function send_message( message ){
		socket.emit( 'messages:create',{ 'room' : my_info.room_id, 'text' :  message });
	}

	var lastMessageOwner = {};
	function append_message( messageObj ){
		/* why this paste..seems like the case of shift+enter */
		messageObj.paste= false; /* /\n/i.test(message.text)  */

		/* fragement or new message */
		messageObj.fragment = lastMessageOwner === messageObj.owner.id;
		messageObj.time = moment(messageObj.posted).calendar();

		var $message = msgTemplate( messageObj);


		$messages = $('.lcb-messages');
		$messages.append(/*'<li>' +*/ $message);

		if( !messageObj.fragment){
			lastMessageOwner = messageObj.owner.id;
		}
		if( scroll_lock === false || messageObj.owner.id === me.id ){
			scrollTo( $messages[0] );
		}
/*		remove_user_typing( messageObj.owner.id ); *//* needs handling	*/
	}

	function scrollTo( $messages ){
    	//messages.scrollTop =  messages.scrollHeight ;
		$('.lcb-messages-container').scrollTop( $messages.scrollHeight );
	}

	log.info ('notify_box loaded');

	return chat_box;
});
