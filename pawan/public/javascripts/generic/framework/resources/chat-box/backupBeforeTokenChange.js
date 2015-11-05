requirejs.config({
	baseUrl: '/javascripts/generic/framework/',
	paths: {
		/* the left side is the module ID,
		 * the right side is the path to
		 * the jQuery file, relative to baseUrl.
		 * Also, the path should NOT include
		 * the '.js' file extension. */
		socketio: 'http://localhost:5000/socket.io/socket.io',
		jscookie: '/javascripts/ext/js-cookie-master/src/js.cookie'

	}
});

define(function(require){
	var $ = require('jquery');
	var log = require('log')('chat-test', 'info');
	var framework = require('framework', 'info');
	var io = require('socketio');
	var cookie_master = require('jscookie');

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
			// page load can be performed here
	
			_d.resolve();

			return _d.promise();
	};
	chat_box.start = function (sess_info) {
		log.info ('chat box Stuff = ', sess_info);
		my_info = sess_info;
		
		$(function() {
			//alert('chat box start called');
		});
		//set cookie on the client side
		var cookie = sess_info.cookie;
		var cookie_value = cookie.split('=')[1];		
		log.info( cookie_value );
//		cookie_master.set('connect.sid', cookie_value);//, { domain : 'http://localhost:5000'  });
//		setCookie('connect.sid',cookie_value);		
		handle_connection(sess_info);
		load_page();				//for now everything is put here only
		$('form').on("click", "#Submit", function() {
				if($('#m').val() != '') {
					btnSend_clickHandler( $('#m').val());
//					$('#messages').append('<li>' + $('#m').val() + '</li>');
					$('#m').val('');
				}
			
		});
		$(document).keypress(function (e) {
			if (e.which == 13) {
				e.preventDefault();
				$('#Submit').click();
			}
		});
	};
	function setCookie(key, value) {
       //     var expires = new Date();
         //   expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
            document.cookie = key + '=' + value + ';domain=' + 'http://localhost:5000';
        }		
	function handle_connection( sess_info ){
		log.info('logging','in');
		socket = io.connect(		//is it global...handle it
				'http://localhost:5000'  //sess_info.root_url
				);
	
		log.info('socket is : ', socket);		
	
		socket.on('connect', function(){
			log.info('connect','done');	
			room_id = sess_info.room_id;			//there goes another global var
			join_room(room_id);
		});
		socket.on('messages:new', function(data){ log.info('received message:', data);  append_message(data.text)});
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
			send_message('new student');
		});
	}
	function send_message( message ){
		socket.emit( 'messages:create',{ 'room' : my_info.room_id, 'text' :  message });
	}

	function btnSend_clickHandler(msg){
		//var msg = $('#msg').val();
		//$('#msg').val('');	
		console.log(msg);
		send_message( msg );
	}
	function append_message(message){
		$('#messages').append('<li>' + message + '</li>');
	}
	function load_page(){ 
		
		$(anchor).html(
			'<br>'
			+ '<ul id="messages"></ul>'
    			+ '<form>'
			+ '<input id="m" autocomplete="off" /><input type="button" id="Submit" value="Send" />'
			+ '</form>'

		);
	}
	
	log.info ('notify_box loaded');

	return chat_box;
});




//unused code

/*	function handle_login( data ){
		$.get('http://localhost:5000/login' ,function( data, response, xhr){ console.log("response was: " + xhr.getAllResponseHeaders() 			) });
	}

	function handle_login1( data ){
		console.log('called handle_login');
		var req = new XMLHttpRequest();
		req.open('GET','http://localhost:5000/login' , false);
		req.send(null);
		var headers = req.getAllResponseHeaders().toLowerCase();
		console.log(headers);

/*		$.post('localhost:5000/account/login', { 
			headers : { cookie : 'connect.sid=s%3A2k_d7L8ipSOSGU1f3Gr56UGjf5LolZAS.4sbL2wMf2m2v6vCeSxnp%2B8jNWj7sJBvTG6oXsms2mz4'  },
			data : { username : 'pawan', password : 'computerg'  }
		
		 },function( data ){ console.log('received from chat server: ' + data)  },
		"json");
*/
/*		var jqxhr = $.ajax("http://localhost:5000/login");//, function(data){
//			console.log( "data from API:" + data );//get the cookie receieved
//		});
		jqxhr.done( function(){  
			console.log('got headers : ' + jqxhr.getAllResponseHeaders() );
		});
*/
/*		var receivedCookie = "connect.sid=s%3A2k_d7L8ipSOSGU1f3Gr56UGjf5LolZAS.4sbL2wMf2m2v6vCeSxnp%2B8jNWj7sJBvTG6oXsms2mz4; Path=/; HttpOnly";
		var jqxhr = $.ajax({
				method:'POST',
				url : "http://localhost:5000/account/login",
				headers : { 'cookie' : "connect.sid=s%3A2k_d7L8ipSOSGU1f3Gr56UGjf5LolZAS.4sbL2wMf2m2v6vCeSxnp%2B8jNWj7sJBvTG6oXsms2mz4; Path=/; HttpOnly"  },
				data : { 'username' : 'pawan', 'password' : 'computerg' }
				});//, function(data){
//			console.log( "data from API:" + data );//get the cookie receieved
//		});
		jqxhr.done( function(){  
			console.log('got headers : ' + jqxhr.getAllResponseHeaders() );
		});
*
	}*/
		/*$.ajax({
		      type: 'POST',
		      url: 'http://localhost:5000/#!/', //'http://localhost:5000',
		      crossDomain: true,
		      cache: false,
		      success: function(data) {

			if($.trim(data) == "false") {
			  alert("Fail to recived data");
			}
			else {
			  alert("Successfully data recived");
			  $('anchor').html(data);
			}

		      }
		    });*/

		//a page in a div doesn't make sense.. approach it differently
		/*$(anchor).load (
				'http://localhost:5000'			//getting cross domain error	
			);*/

		/*	    +'<textarea rows="2" cols="50" style="color: red; background-color: lightyellow"> History: </textarea>'
			    +'<input style="color: #C0C0C0;" type="text" name="message" id="msg" color = "red"><br>'
			    +'<input type="button" id="btnSend" color ="red" value="Send"/>'
		*/


/*
	function make_token_request(){
		 $.ajax({
 	       		//this is a 'cross-origin' domain
	        	url : "http://localhost:5000/users",
	        
		        beforeSend : setHeader,
	       		success : function(data) {
	            		alert("success");
				log.info(data);
	        	},
		        error : function(jqXHR, textStatus, errorThrown) {
		            alert("error");
       			 }
	   	 });
	}
	function setHeader(xhr) {
	    xhr.setRequestHeader('Authorization', 'Bearer NTYyNGRiNmJjNGQ3NGJmZjJlOGE3NzVkOjQ2ZDA3N2NiMWJlMjJiNTA4YmNhNTM5Nzc1OTU3MTgyZmEwMjA4NzZmYzAwYzQwMQ==');
	}




*/
