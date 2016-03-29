var encryption     = require ( 'auth/common/encryption' );
var log            = require ( 'auth/common/log' ).child({ 'sub-module' : 'auth/encode' } );

var exports = module.exports = {};

function get_user_details ( User )
{
	identity.vc_auth_ts     = (new Date()).toISOString();
	identity.id             = User.id || identity_defaultValues.id;
	identity.displayName    = User.displayName || identity_defaultValues.displayName;
	identity.name           = User.name || identity_defaultValues.name;
	identity.nickname       = User.nickname || identity_defaultValues.nickname;
	identity.birthday       = User.birthday || identity_defaultValues.birthday;
	identity.anniversary    = User.anniversary || identity_defaultValues.anniversary;
	identity.gender         = User.gender || identity_defaultValues.gender;
	identity.utcOffset      = new Date().getTimezoneOffset();
	identity.emails         = User.emails || identity_defaultValues.emails;
	identity.photos         = User.photos || identity_defaultValues.photos;
	identity.addresses      = User.addresses || identity_defaultValues.addresses;
	identity.phoneNumbers   = User.phoneNumbers || identity_defaultValues.phoneNumbers;

	/* set primary attribute , if not set already */
	setPrimaryAttribute(identity.emails);
	setPrimaryAttribute(identity.photos);
	setPrimaryAttribute(identity.addresses);
	setPrimaryAttribute(identity.phoneNumbers);
    
	/* encrypt identity and return */
	var MAX_SIZE_COOKIE = 4096;
	var auth_string = JSON.stringify ( identity );
	if( Buffer.byteLength( auth_string ) > MAX_SIZE_COOKIE ){
		auth_string = "error: size_limit_exceeded";
	}
	/* encrypt user_info */
	auth_string = encryption.encrypt ( log, auth_string );

	return auth_string;
}

/* explicitly setting primary attribute for composite array type values
 * setting only the first entry as the primary one */
function setPrimaryAttribute ( variable )
{

	if( variable.length >= 1 )
		{
			for(var i = 0; i < variable.length; i++)
			{
				/* only if primary parameter is not present, set it as true for first array entry */ 
				if ( i == 0 )
					{
						if ( !variable[i].primary )
							variable[i].primary = true;
					}
					else variable[i].primary = false;

			} 
		}

}

/*
 * The identity is based (partially) off the specifications here:
 * Portable Contacts 1.0 Draft C
 * http://portablecontacts.net/draft-spec.html#schema
 */
var identity = {
	vc_id       : null,                   /* Assigned by the session controller */
	vc_auth_ts  : '1992-03-07',
	id          : '--random-default-id',
	displayName : 'buddha is smiling',
	name        : '--none-yet--',
	nickname    : '--none-yet--',
	birthday    : '--none-yet--',
	anniversary : '--none-yet--',
	gender      : '--none-yet--',
	utcOffset   : '--none-yet--',
	emails      : [
		{
			value   : '--random@email.com--',
			type    : '--none-yet',    /* work, home or other */
			primary : true
		},
	],
	phoneNumbers: [
		{
			value   : '--none-yet',
			type    : '--none-yet',    /* work, home or other */
			primary : true
		},
	],
	photos      : [
		{
			value   : '--none-yet',
			type    : '--none-yet',    /* work, home or other */
			primary : true
		},
	],
	addresses   : [
		{
			formatted     : '--none-yet',
			streetAddress : '--none-yet',
			locality      : '--none-yet',
			region        : '--none-yet',
			postalCode    : '--none-yet',
			country       : '--none-yet',
		},
	],

};



var identity_defaultValues = {
	
	id          : '123456',
	displayName : 'User123',
	nickname    : 'user123',
	birthday    : '12-12-12',
	anniversary : 'never',
	gender      : 'M/F',
	utcOffset   : 'aj4',
	emails      : [
		{
			value   : '--none-yet',
			type    : '--none-yet',    /* work, home or other */
			primary : true
		},
	],
	phoneNumbers: [
		{
			value   : '--none-yet',
			type    : '--none-yet',    /* work, home or other */
			primary : true
		},
	],
	photos      : [
		{
			value   : '--none-yet',
			type    : '--none-yet',    /* work, home or other */
			primary : true
		},
	],
	addresses   : [
		{
			formatted     : '--none-yet',
			streetAddress : '--none-yet',
			locality      : '--none-yet',
			region        : '--none-yet',
			postalCode    : '--none-yet',
			country       : '--none-yet',
		},
	],

};

exports.get_user_details = get_user_details;

