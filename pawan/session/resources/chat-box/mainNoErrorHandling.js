var $ = require('jquery-deferred');
//var Client = require('node-rest-client').Client;
var rest = require('restler');
var chat = {};
var room_id = {};
var cookie_admin = {};
var root_url = {};
/*
		create a room through API call
		when init user is called : add user to room and return room id and authentication tokens etc	


	*/

chat.init = function (myinfo, common, handles) { 

	var _d = $.Deferred ();
	log = handles.log;

	log.info ('chat-box: init :', myinfo);
	
	root_url 	= 'http://localhost:5000';	//maybe coming from myinfo
	var class_title = 'C-101',		//for now make them global
	    session_id 	= '00001',
	    class_desc  = 'Hello world Class, Once in a lifetime thing';
	
	var _d_login	= {},
	    _d_room	= {};	

	//login related calls : admin account
	_d_login = login_to_letsChat( 'admin', 'computerg' );
	_d_login.then(function( cookie ){
//			console.log('done...login' + cookie);
			cookie_admin = cookie;
			_d_room = create_room( class_title, session_id, class_desc );
			_d_room.then( function( rid ){
//				console.log('room id: ' + rid);
				room_id = rid;
				_d.resolve();
			 });	
		}
	);

	
/*	rest.get("http://localhost:5000/rooms",
		{ headers : { cookie : 'connect.sid=s%3AIdzlLnVDovlrVYhAIRP3y9SBMNCFASee.eN3jJvCkPsgjIYGCIyuQbwoN38jFlNUzptaFdlLDTqg'  } }
	).on('complete',function(data){ console.log(data)} );*/
/*	rest.post( 'http://localhost:5000/rooms', {
		headers : { cookie :  'connect.sid=s%3AIdzlLnVDovlrVYhAIRP3y9SBMNCFASee.eN3jJvCkPsgjIYGCIyuQbwoN38jFlNUzptaFdlLDTqg' },
		data : { "slug" : "checkTheRetData ",
			 "name" : "APICreated",
			 "description" : "will delete it soon" }
	}).on('complete', function(data){ console.log(data)  });

*/	
	return _d.promise ();
};

chat.init_user = function (user) { 
	var _d = $.Deferred ();
	var uname 	= {},	//received as argument
	    passwd 	= {},
	    cookie_user	= {};
	//create a user 
		uname 	= 'pwn';
		passwd 	= 'computerg';

	var _d_login = login_to_letsChat( uname, passwd);
	_d_login.then( function(cookie){
		cookie_user = cookie;
		log.info('@@@ final resolve from chat box init_user');
		_d.resolve({
			'cookie' : cookie_user,
			'room_id': room_id
		});
		
	});

/*	_d.resolve ({
		cookie : cookie_user,
		roomid : room_id
	});
*/
	return _d.promise ();
};
function login_to_letsChat( username, password ){
	var _d = $.Deferred ();
	var temp_cookie = {};
	var final_cookie = {};
//	console.log('inside login');
	/*
	 * remove these hard links  
	 * by making them come from config file
	 */
	// initiate login 
	rest.get( root_url +  '/login').on('complete',function(result, response){
			temp_cookie = JSON.stringify( response.headers['set-cookie'] );
			//	console.log('after get' + JSON.stringify( temp_cookie) ); // actual login request
			rest.post( root_url + "/account/login",{
headers : { cookie : temp_cookie  },
data : { username : 'admin', password : 'computerg' }
}
).on('complete', function(result, response){
	final_cookie = JSON.stringify(response.headers['set-cookie'] );
	//		console.log( 'final cookie : ' + final_cookie );
	//		cookie_admin = final_cookie; //for now, the return value will be assigned as it is an independent module
	//		room_id = create_room( class_title, session_id, class_desc   );
	//		console.log('resolvind request');
	_d.resolve( final_cookie  );
	});
			log.info('####returning from login' , JSON.stringify(final_cookie) );
			//		console.log( 'cookie received : ' + temp_cookie );
			});
//	return final_cookie;
//	_d.resolve( final_cookie );
	return _d.promise ();	
}

function create_room( name, short_name, desc ){
	var _d = $.Deferred ();
	var return_value = "false";
	_d.resolve( "5620a20aa31f5f500c8b9a60");
	return _d.promise();
	/* to do
	 * do string manipulations on the cookie_admin and 
	 * create room and store roomid
	 */	
//	console.log('cookie_admin create room: ' + cookie_admin); 
	rest.post( root_url + '/rooms', { 
			headers : { 'cookie' : cookie_admin },
			data    : { 
					"slug" 		: short_name,
					"name" 		: name,
					"description" 	: desc
				  }
		}).on('complete',function(data){
			console.log('room is : ' + JSON.stringify(data) );
			return_value = data ;		//see what is to be returned...if room id will suffice! 
		});
		// add handlers for onfailure, onerror, ontimeout etc.
	_d.resolve( return_value );
	return return_value; //_d.promise ();
}
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.response;
}

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

module.exports = chat;
