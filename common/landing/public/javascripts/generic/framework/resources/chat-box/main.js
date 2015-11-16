requirejs.config({
	baseUrl: '/javascripts/generic/framework/',
	paths: {
		/* the left side is the module ID,
		 * the right side is the path to
		 * the jQuery file, relative to baseUrl.
		 * Also, the path should NOT include
		 * the '.js' file extension. */
		
		/*
		 * remove this hardcoded server url somehow
		 */
		socketio: 'http://localhost:5000/socket.io/socket.io',
	}
});

define(function(require){
	var $ = require('jquery');
	var log = require('log')('chat-test', 'info');
	var framework = require('framework', 'info');
	var io = require('socketio');

	var chat_box = {};
	var anchor = {};
	var my_info = {};
	/*
	 * create connection
	 * join room
	 * and do your stuff
	 */

		
	chat_box.init = function (_framework, custom, perms) {
			var _d = $.Deferred();

			log.info ('chat_box init called');

			anchor = _framework.anchor;
			
			load_page();				//for now everything is put here only
			$('form').on("click", "#Submit", function() {
				if($('#m').val() != '') {
					send_message( $('#m').val());
					$('#m').val('');
				}
			
			});
			$(document).keypress(function (e) {
				if (e.which == 13) {
					e.preventDefault();
					$('#Submit').click();
				}
			});	
			_d.resolve();

			return _d.promise();
	};
	chat_box.start = function (sess_info) {
		log.info ('chat box Stuff = ', sess_info);
		my_info = sess_info;
		
		$(function() {
			//alert('chat box start called');
		});
		//token, to be used as auth-token when communicating
		my_token = sess_info.token;
		log.info( my_token );
		
		handle_connection(sess_info);
		//separate the view and control by using (say) events

	};
	function handle_connection( sess_info ){
		log.info('logging','in');
		socket = io.connect(		
				sess_info.root_url,
				{ 
					query : 'token=' + my_token
				});
	
		log.info('socket is : ', socket);		
	
		socket.on('connect', function(){
			log.info('connect','done');	
			room_id = sess_info.room_id;			//there goes another global var
			join_room(room_id);
		});
		socket.on('messages:new', function(data){ log.info('received message:', data);  append_message(data)});
	}
	function join_room( room_id ){
		log.info('connecting to', room_id);
		//check if soket is null
		socket.emit('rooms:join', { roomId : room_id, password : ''}, function(resRoom){
			room = resRoom; 	// see it's global
			log.info('connected ', room);
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
		});
	}
	function send_message( message ){
		socket.emit( 'messages:create',{ 'room' : my_info.room_id, 'text' :  message });
	}

	function append_message( json_response ){
		var sender_name = json_response.owner.displayName;
		var message 	= json_response.text;
		$("#messages").html(function(i,origText){
			return origText + "\n" + sender_name + " : " +  message;
		});
	}
	function load_page(){ 
		
		$(anchor).html(
			'<br>'
//			+ '<ul id="messages"></ul>'
			+ '<textarea id="messages" rows="4" cols="65" style="color: red; background-color: lightyellow"> History: </textarea>'
    			+ '<form>'
			+ '<input id="m" style="color: red" autocomplete="off" /><input type="button" style="color: Red" id="Submit" value="Send" />'
			+ '</form>'

		);
	}
	
	log.info ('notify_box loaded');

	return chat_box;
});
