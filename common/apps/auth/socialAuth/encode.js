var exports = module.exports = {};
/*
 * Query string:
 *     id=
 *     display_name=
 *     email=
 */
function query (variable) {
	/*var query = window.location.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (decodeURIComponent(pair[0]) == variable) {
			return decodeURIComponent(pair[1]);
		}
	}
	return null;*/
}

exports.query = query;

//***********************************
function getUserDetails(User)
{
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
   setPrimaryAttribute(identity.emails);
   setPrimaryAttribute(identity.photos);
   setPrimaryAttribute(identity.addresses);
   setPrimaryAttribute(identity.phoneNumbers);
//   console.log('User data in getUserDetails ************ '+ User.id +' '+User.nickname+ ' '+User.photos[0].primary);
  // console.log('identity in getUserDetails *************  '+identity.id+ ' '+identity.nickname+' '+identity.photos[0].primary);
   
   return identity;
   
}

/*explicitly setting primary attribute for composite array type values
    setting only the first entry as the primary one*/
function setPrimaryAttribute(variable)
{
  
  if( variable.length >= 1 )
   {
     for(var i = 0; i < variable.length; i++)
     {
       /*only if primary parameter is not present, set it as true for first array entry */ 
       if(i == 0)
       {
          if(variable[i].primary == undefined || variable[i].primary == null )
            variable[i].primary = true;
       }
       else variable[i].primary = false;

     } 
   }

}


function get(attribute)
{
   if(attribute != undefined || attribute != null)
     return attribute;
   else return identity_defaultValues.attribute;

}

//************************************

exports.getUserDetails = getUserDetails;


var id = query('id');
var display_name = query('display_name');
var email = query('email');

/*
 * The identity is based (partially) off the specifications here:
 *     Portable Contacts 1.0 Draft C
 *         http://portablecontacts.net/draft-spec.html#schema
 */
var identity = {
		vc_id       : null,                   /* Assigned by the session controller */
		vc_auth_ts  : (new Date()).toISOString(),
		id          : id || '--random-default-id',
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
                //vc_id       : null,                   /* Assigned by the session controller */
                //vc_auth_ts  : (new Date()).toISOString(),
                id          : '123456',
                displayName : 'User123',
                nickname    : 'user123',
                birthday    : '12-12-12',
                anniversary : 'never',
                gender      : 'M/F',
                utcOffset   : 'aj4',
                emails      : [
                        {
                                value   : 'ny',
                                type    : 'ny',    /* work, home or other */
                                primary : true
                        },
                ],
                phoneNumbers: [
                        {
                                value   : 'ny',
                                type    : 'ny',    /* work, home or other */
                                primary : true
                        },
                ],
                photos      : [
                        {
                                value   : 'ny',
                                type    : 'ny',    /* work, home or other */
                                primary : true
                       },
                ],
                addresses   : [
                        {
                                formatted     : 'ny',
                                streetAddress : 'ny',
                                locality      : 'ny',
                                region        : 'ny',
                                postalCode    : 'ny',
                                country       : 'ny',
                        },
                ],

};



/*
 * This should extract and store the identity of the 
 * current user. Likely this will happen by extracting
 * the encrypted information in the cookies, which will
 * be stored via the passport auth module. TODO.
 *
 * Hardcoding for now. */


var id_string = JSON.stringify(identity);
var id_uriencoded = encodeURIComponent(id_string);

//document.cookie = "wiziq_auth=" + id_uriencoded + "; max-age=7200; path=/";
//console.log ('cookies = ', document.cookie);

//window.location = '/landing/session/v1/meghadoot';
