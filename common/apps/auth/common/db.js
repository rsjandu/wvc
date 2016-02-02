var $        = require('jquery-deferred');
var mongodb  = require('mongodb');
var mongoose = require('mongoose');
var config   = require('auth/socialAuth/oauth.js');
var args     = require('common/args');
var log      = require('auth/common/log');
//var events   = require('events');

//var emitter = new events.EventEmitter();

/*
 * Initialize and connnect */
/*global variables. not to be intialized again and again*/
var Credential;
var Schema;
var userSchema;
var connection = mongoose.createConnection ("mongodb://localhost/Wiziq_Auth");

connection.on('error', function (err) {
	log.error ({ error : err }, 'Connection error');
});

connection.on('disconnected', function () {
	log.warn ('disconnected');
});

connection.on('connected', function () {
	log.info ('connected');
});

connection.once('open', function (callback) {
	log.info ({ db : "mongodb://localhost/Wiziq_Auth" }, 'connection OK');
	//emitter.emit('db-connected');
	createSchema();
});


/*for now connect to db and then create a schema there, if not present already,
 *this was done just to check addition of entries to db via code.*/

function createSchema (){
	//var _deff = $.Deferred();

	if( !Schema ){
		var Schema = mongoose.Schema;
	}

	if( !userSchema ){
		var userSchema = new Schema({
			hostName     : { type: String, required: true },
			authType     : { type: String, required: true },
			clientID     : { type: String, required: true },
			clientSecret : { type: String, required: true },
			callbackURL  : { type: String, required: true }
		});

		userSchema.index({ hostName: 1, authType: 1}, { unique: true });
	}

	if( !Credential ){
		Credential = connection.model('Credential', userSchema);
	}
	var cred = new Credential({
		hostName     : 'akshit.me',
		authType     : 'google',
		clientID     : '794373405384-6u7bipelrp33kh8samdgsks0migb561d.apps.googleusercontent.com',                                            
		clientSecret : 't4xiO3YLbpDUEIz1PI8AA2wJ',
		callbackURL  : 'https://akshit.me/auth/auth/google/callback'

	});

	/*this is done to search for any entry with same combination of hostname
	  and authtype add only if not present. this avoids duplicacy*/        
	Credential.findOne({ 'hostName' : cred.hostName , 'authType' : cred.authType }, function (err, olduser) {
		if (!err) {
			if (olduser) {
				log.info({Info:"Entry Already Exists"});
			}
			else if (!olduser) {
				cred.save(function (err, done) {
					if (!err) {
						log.info({Info:"Credential "+cred});
					}
					else {
						log.info({Error:"Error while saving data to db "+cred});
					}						
				});
			}
		}			
		else {
			log.info({Error:"Error in saving data to db"});

		}
	});


}

/*if data present in local identity structure
  -> fetch from it
  else
  -> connect to mongo db (if not connected already)
  -> fetch data from db, store it locally and use it  		
  "else" part has been implemented in the following function*/

function fetch_data_from_db(authType,req,res)
{
	var _d = $.Deferred();
	/*return if connection is not established*/
	if( !connection || (connection && connection.readyState != 1  ) )
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
					log.info({Info:"Entry Already exists in db (fetch_data_from_db)" + olduser+" "+config.google.clientID +" "+config.google.clientSecret+" "+config.google.callbackURL });
					_d.resolve();
				}	
				else if (!olduser) {
					req.flash('message', 'welcome key is not present');
					_d.reject();
				}	
			}
			else {
				log.error({Error:"Error in fetching data from the database"});
				_d.reject(err);
			}
		});

		return _d.promise();  
}

/*this is done to search for any entry with same combination of hostname
  and authtype add only if not present. this avoids duplicacy*/

function add_data_to_db(credential_obj)
{
	var _d = $.Deferred();

	var cred = new Credential({
		hostName     : credential_obj.hostName,
		authType     : credential_obj.authType,
		clientID     : credential_obj.clientID,
		clientSecret : credential_obj.clientSecret,
		callbackURL  : credential_obj.callbackURL
	});
	Credential.findOne({ 'hostName' : credential_obj.hostName, 'authType' : credential_obj.authType }, function (err, olduser) {
		if (!err) {
			if (olduser) {
				log.info({Info:"Entry Already Exists in db while adding data to db"});
				_d.resolve();
			}
			else if (!olduser) {
				cred.save(function (err, done) {
					if (!err) {
						log.info({Info:"Credential "+cred});
						_d.resolve();
					}
					else {
						_d.reject(err);
					}		
				});
			}
		}
		else {
			log.info({Error:"Error in saving (add_data_to_db)"});
			_d.reject(err);
		}
	});
	return _d.promise();
}

function delete_entry_from_db(credential_obj)
{
	var _d = $.Deferred();
	/*this is done to search for any entry with same combination of hostname
	  and authtype, delete if  present. this avoids duplicacy*/
	Credential.findOne({ 'hostName' : credential_obj.hostName, 'authType' : credential_obj.authType }, function (err, olduser) {
		if (!err) {
			if (olduser) {
				log.info({Info:"Entry Exists and deleted"});
				var query = Credential.remove({ 'hostName' : credential_obj.hostName, 'authType' : credential_obj.authType });
				query.exec();
				_d.resolve();
			}
			else if (!olduser) {
				log.info({Info:"No entry as such in db. No deletion required"});
				_d.resolve();
			}
		}
		else {
			log.info({Error:"Error in deletion of data from db"+err});
			_d.reject(err);
		}
	});
	return _d.promise();
}




var db = {};
db.conn = connection;
db.createSchema = createSchema;
db.fetch_data_from_db = fetch_data_from_db;
db.add_data_to_db = add_data_to_db;
db.delete_entry_from_db = delete_entry_from_db;

module.exports = db;

