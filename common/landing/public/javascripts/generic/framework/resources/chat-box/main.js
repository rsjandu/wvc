define(function(require){
	var $ = require('jquery');
	var moment = require('./moment.min');
	var log = require('log')('chat-test', 'info');
	var framework = require('framework');
	var io = require('socketio');

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
		my_info = sess_info;
		
		/*  token, to be used as auth-token when communicating */
		my_token = sess_info.token;
		
		handle_connection(sess_info);

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

	function handle_connection( sess_info ){
		log.info('logging','in');
		socket = io.connect(		
				sess_info.root_url,
				{ 
					query : 'token=' + my_token
				});
	
		socket.on('connect', function(){
			log.info('connect','done');	
			room_id = sess_info.room_id;		
			who_am_i();	
			join_room(room_id);
		});
		socket.on('messages:new', function(data){ log.info('received message:', data);  append_message(data); });
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
		if(e.type === 'keypress' && e.keyCode !== 13 || e.altKey)
			return;
		if(e.type === 'keypress' && e.keyCode === 13 && e.shiftKey)
			/* 
			 * shift+enter let u send multi line messages
			 * 	this is what sets the paste option 
			 * 	on receive handle them differently (use pre tag)
			 */
			return;
		e.preventDefault();


		var $textarea = $('.lcb-entry-input');
		if(!$textarea.val())
			return;

		send_message( $textarea.val() );
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
	}

	function scrollTo( $messages ){
    	//messages.scrollTop =  messages.scrollHeight ;
		$('.lcb-messages-container').scrollTop( $messages.scrollHeight );
	}
		
	log.info ('notify_box loaded');

	return chat_box;
});
