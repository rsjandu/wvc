var $ = require('jquery-deferred');
var rest = require('restler');
var chat = {};
var m_room = {};  //master room
var cookie_admin = {};
var root_url = {};
var users = {};
var req_timeout = {};

/*
 * Login as admin and create a room
 */
chat.init = function (myinfo, common, handles) { 

	var _d = $.Deferred ();
	log = handles.log;

	log.info ('chat-box: init :', JSON.stringify(myinfo));
	
	root_url 	= myinfo.custom.server_url;
	req_timeout = myinfo.custom.req_timeout;
	var random_str  = get_random_string();
	/*
	 * create a master room for the session with the following data
	 */
    m_room.name 	= 'room' + random_str;			
	m_room.slug		= 'sess' + random_str;
	m_room.desc  	= 'desc' + random_str;
//	room.participants = added in allowuser method
	
	var _d_login	= {},
	    _d_room	= {};	

	/*
	 * login related calls : admin account (don't get confused, admin is just a name, not a role. Hence no speacial perms yet)
	 */
	_d_login = login_to_letsChat( 'admin', 'admin1234' );

	_d_login.then(	
			function done( cookie ){
				log.debug ('lets-chat: cookie-admin = ' + cookie);
				cookie_admin = cookie;
				_d_room = create_room( m_room.name, m_room.slug, m_room.desc );
				_d_room.then( 
						function room_done( rid ){
							log.info('roomid',rid);
							m_room.id = rid;			//store room id for session
							_d.resolve(); 

					  	},
						function room_failed( message ){
							_d.reject(message);	
						}
					);	
			},
			//fail callback
			function fail( message ){
				log.warn('Fail:', message );
				_d.reject(message);
			}
	);

	return _d.promise ();
};


chat.init_user = function (user) { 
	var _d = $.Deferred ();
	if( !m_room.id){
		log.error('no room found');
		_d.reject('no room created');
		return _d.promise();
	}
	var uname 	= {},	
	    passwd 	= {},
	    cookie_user	= {},
	    user_token 	= {};
	/*
	 * create a user 
	 * username will be saved in lowercase(whatever you pass) and certain queries will not work if uppercase letters are found in username.
	 * eg. WizIQ will be saved as 'wiziq'
	 */
	uname 	= user.vc_id + get_random_string();					/* add some 5chars random string here, just avoiding removeUser */
	passwd 	= generate_password( uname );
	log.info( uname, passwd);
	var _d_create = create_user( uname, passwd );

	_d_create.then(
		function done(message){
			log.info('username', uname );
			var _d_login = login_to_letsChat( uname, passwd);
			_d_login.then( 
				function done(cookie){					//is it ok creating methods with the same name
					cookie_user = cookie;
					get_token( cookie_user )
					.then(	
						function gotToken( token ){
							user_token = token;
							log.info('Chat-Box:', 'init_user resolved');
							/*
							 * add the user to the room so that room becomes visible to the user
							 */
							allow_user_to_room( m_room, uname.toLowerCase() )
								.then(
									function(){
										_d.resolve({
										'root_url' : root_url,
										'token'    : user_token,
										'room_id'  : m_room.id,
										'username' : user
										});		
									},
									function (err) {
										log.error ('allow_user_to_room: err = ' + err);
										_d.reject(err);
									}
								);
						},
						function noToken( message ){
							_d.reject( message );
						}
					);
				},
				function fail(message){
					_d.reject( message );
				}
     		);
		},
		function fail(message){
			_d.reject( message );			
		}
	);
	return _d.promise ();
};
function allow_user_to_room( room, uname){
	var _d = $.Deferred();
	/*
	 * username is lowercase
	 * no duplicate entries
	 * the list sent will be copied as it is(previous data will be overwritten), so you might want to retrieve the list first and then
	 * send 
	 * but in our case the local copy should be the same 
	 */
	users = users +(!users ? '' : ',' )  + uname; //added to list for now
	rest.put( root_url + '/rooms/' + m_room.id,
			 {
			 	headers 	: 	{ cookie : cookie_admin },
				timeout		: 	req_timeout,
			 	data 		:	
					{
						id 				: m_room.id,
						name 			: m_room.name,
						slug			: m_room.slug,
						description 	: m_room.desc,
						participants 	: users,
						password		: ''
					}
			 }
			).on('complete', function(data,res){
				log.info('update_request got: ' + JSON.stringify(data) );
				_d.resolve();			
			}).on('timeout', function(){
				_d.reject(' req timed out');
			});
	return _d.promise();
}
function get_random_string(){
	return  Math.random().toString(36).substr(2, 5);
}
function generate_password( username ){
	//maybe we will store it to some list
	return 'computerg';
}

function create_user(username, password){
	var _d = $.Deferred ();
	var email	 = username + '@vc.team'; 
	var display_name = username.slice(0,-5);	
	rest.post( root_url + '/account/register',{ 
		timeout : req_timeout,
		data : { 
			'username' 	: username,
			'email'	   	: email,
			'display-name'  : display_name,
			'first-name'	: username,
			'last-name'	: username,
			'password'	: password,
			'password-confirm' : password 
		 }
	}).on('complete', function( data){
		log.info('createUser: ', data);
		if(data.status === 'success'){
			_d.resolve( data.message );
		}
		else{
			_d.reject( data.message );
		}
	}).on('timeout', function(){
		_d.reject('request timed out');
	});
	return _d.promise();
}

function login_to_letsChat( username, password ){
	var _d = $.Deferred ();
	var final_cookie 	= {};

	rest.post( root_url + "/account/login",{
		timeout 	: req_timeout,
		data 		: { 'username' : username, 'password' : password }
	}).on('complete', function(result, response){
		try{
			if( response && response.headers ){
				final_cookie = JSON.stringify(response.headers['set-cookie'] );
				final_cookie = final_cookie.substr(2, final_cookie.indexOf(';') - 2);
				_d.resolve( final_cookie  );
			}
			else{
				_d.reject('could not log-in to ' + root_url);
			}
		}
		catch( e){
			_d.reject('error reading cookie');
		}
		
	}).on('timeout', function(){
		_d.reject('request timed out');
	});
	
	return _d.promise ();	
}

function get_token( cookie ){
	var _d = $.Deferred();
	rest.post( root_url + '/account/token/generate',{  
		headers : { 'cookie' : cookie },
		timeout : req_timeout
	}).on('success',function( response ){	
		log.info( response );
		_d.resolve( response.token );
	}).on('complete',function( data ){
		if(_d.state() === 'pending'){
			_d.reject('could not get token');
		}
	}).on('timeout',function(){
		_d.reject('request timed out');
	});
	return _d.promise();
}

function create_room( name, short_name, desc ){
	var _d = $.Deferred ();
//	_d.resolve( "56402abbc1b356030b53bbb5");		// just use one room while dev. 
//	return _d.promise();

	rest.post( root_url + '/rooms', {				//timeout can be added 
			headers : { cookie : cookie_admin },
			timeout : req_timeout,
			data    : { 
					"slug" 		: short_name,
					"name" 		: name,
					"description" 	: desc,
					"private"		: true
				  }

		}).on('success', function( room ){
			if( room && room.id ){
				_d.resolve( room.id );
			}
		}).on('complete',function(data){
			log.info ('lets-chat : data = ' + JSON.stringify(data, null, 2));
			if( _d.state() == 'pending'){
				_d.reject('room creation failed');
			}
		}).on('timeout',function(){
			_d.reject('req timed out');
		});
		// add handlers for onfailure, onerror, ontimeout etc.
	return _d.promise(); 
}

function delete_room( id ){
	var _d = $.Deferred ();
	rest.del(
		root_url + '/rooms' + '/' +  id, 
		{ headers : { cookie : cookie_admin  }  }
	).on('success',function(data){
		console.log( data );
		_d.resolve();
	}).on('complete', function( data ){
		console.log('called complete');
		if( _d.state() == 'pending'){
			console.log( data);
			_d.reject('room delete failed');
		}		
	});
	return _d.promise();	
}

module.exports = chat;
