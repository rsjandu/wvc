var $        = require('jquery-deferred');
var mongodb  = require('mongodb');
var mongoose = require('mongoose');
var config   = require('auth/socialAuth/oauth.js');
var args     = require('common/args');


/*
 * Initialize and connnect */
/*var connection = mongoose.createConnection ("mongodb://localhost/Wiziq_Auth");

connection.on('error', function (err) {
        console.log( 'Connection error '+ err);
});

connection.on('disconnected', function () {
        console.log ('database disconnected');
});

connection.on('connected', function () {
        console.log('connected');
});

connection.once('open', function (callback) {
        console.log('connection OK');
        
}); */

var connection;
var Credential;

function connect_to_db(){
	var _d = $.Deferred();
    connection = mongoose.createConnection("mongodb://localhost/Wiziq_Auth");
 connection.on('error', function (err) {
        console.log( 'Connection error '+ err);
	_d.reject( err);
 });

 connection.once('open', function (callback) {
        console.log('connection OK');
	_d.resolve();
 });
  
 return _d.promise();
}

/*function save_content(cred)
{
 
   var _d = $.Deferred();
   cred.save(function (err, data) {
            if (err)
            {
                console.log(err);
                _d.reject(err);
            }
            else
            {
                console.log('Saved ', data );
                _d.resolve();
            }
        });
 return _d.promise();

}*/

/*for now connect to db and then create a schema there, if not present already, this was done just to check addition of entries to db via code.
 later, we ll have a RESTful api to add/delete entries and the following method will reduce to only connection with the database*/

function createSchema (){
    var _deff = $.Deferred();
//	console.log("it is development environement 2 *************************");   
	 connect_to_db()
	 .then(
		function done(){
            //console.log("promise returned with true value "+connection );
			var Schema = mongoose.Schema;
		    var userSchema = new Schema({
		 		hostName     : { type: String, required: true },
		 		authType     : { type: String, required: true },
		 		clientID     : { type: String, required: true },
		 		clientSecret : { type: String, required: true },
		 		callbackURL  : { type: String, required: true }
		    });
 
         	userSchema.index({ hostName: 1, authType: 1}, { unique: true });        
         //	console.log("xxxxxxxxxx 1 "+userSchema);

		    Credential = connection.model('Credential', userSchema);
      
         //	console.log("xxxxxxxxxx 2 "+Credential);
		 
		 	var cred = new Credential({
		  		hostName     : 'akshit.me',
		  		authType     : 'google',
		  		clientID     : '794373405384-6u7bipelrp33kh8samdgsks0migb561d.apps.googleusercontent.com',                                            
 				clientSecret : 't4xiO3YLbpDUEIz1PI8AA2wJ',
		  		callbackURL  : 'https://akshit.me/auth/auth/google/callback'

		 	});
		  
           //console.log("xxxxxxxxxx 3 "+cred);
 
		  /* cred.save(function (err, data) {
            
        	if (err)
			{
 				console.log("error zxxxxxxxxxxxxxxxxxxxxx  "+err);
                _deff.reject(err);
 	        }	        
 			else
			{
 		   		console.log('Saved ', data );
                _deff.resolve();
                
			}	
		});*/
        /*this is done to search for any entry with same combination of hostname
          and authtype add only if not present. this avoids duplicacy*/        
        Credential.findOne({ 'hostName' : cred.hostName , 'authType' : cred.authType }, function (err, olduser) {
                    if (!err) {
                        if (olduser) {
                            console.log('Entry Already Exists');
                            _deff.resolve();
					    }
                        else if (!olduser) {
                             cred.save(function (err, done) {
                                if (!err) {
                                    console.log('Credential '+cred);
                                    _deff.resolve();
                                }
                                else {
                                    _deff.reject(err);
                                }
                            });
                        }
                    }
                    else {
                        console.log('Error in saving');
                        _deff.reject(err);
                    }
                  }); 

     
       //console.log("xxxxxxxxxx 4 ");

		},
	function fail( err){
     console.log("promise returned with false value");
     _deff.reject(err);
	}
 ); 
  
  return _deff.promise();
}

/*if data present in local identity structure
    -> fetch from it
  else
    -> connect to mongo db (if not connected already)
    -> fetch data from db, store it locally and use it

 "else" part has been implemented in the following function*/

function fetch_data_from_db(authType)
{
 	var _d = $.Deferred();
     
 
	 if( connection == null || connection == undefined )
      {
  		_d.reject();
  		return _d.promise();
      }		
      
      var host = args.session_server_ip () ? args.session_server_ip () : 'localhost';
      
     	
      
      Credential.findOne({ 'hostName' : host, 'authType' : authType }, function (err, olduser) {
                    if (!err) {
                        if (olduser) {
                            config.google.clientID = olduser.clientID;
                            config.google.clientSecret = olduser.clientSecret;
                            config.google.callbackURL = olduser.callbackURL;
                          //  console.log('Entry Already xxxxxxxx' + olduser+' '+config.google.clientID +' '+config.google.clientSecret+ ' '+config.google.callbackURL );
                            _d.resolve();
                        }
                        else if (!olduser) {
                             _d.reject();
                            /* cred.save(function (err, done) {
                                if (!err) {
                                    console.log('Credential '+cred);
                                    _deff.resolve();
                                }
                                else {
                                    _deff.reject(err);
                                }
                            });*/
                        }
                    }
                    else {
                        console.log('Error in saving');
                        _d.reject(err);
                    }
                  });
     
   return _d.promise();  
}





var db = {};
//db.conn = connection;
db.createSchema = createSchema;
db.fetch_data_from_db = fetch_data_from_db;

module.exports = db;

