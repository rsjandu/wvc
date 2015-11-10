//group chat related functionalities having  getRoom and addUser as interface/exposed methods


/*
 *	the one which looks good:::
 *		map the usernames to integers :
 *			adv 	: room names becomes just session_id:2,8,12 ( integers being sorted)
 *			disadv	: we need to create a string by searching for the mapping
 */

/*
 * we will be storing 
 * 1. room_names and room_id pairs
 * 2. usernames - integer mapping list
 * 3. the session_id for sure
 */

//1st method of the interface
function getRoom( users  ){				
	
	get_room_name( users )
	.then( function( searchStr){
		search_rooms( searchStr )				//do we even need this?  
		.then( function( found, rid ){
				if( found ){					
					return rid;
				}
				else{
					create_room( searchStr )
					.then(function(rid){
						allow_users_to_room( rid, users)
						.then( function( ){
							tell_participants( rid, users )
							.then( function(){
								//all done
							});						
						});
					});
				}
		});	
	});

}
function get_room_name( users ){
	var room_name = session_id;
	//for each user in users 
		//read the integer value.
	//sort the integers 
	
	//for each sorted integer
	// room_name += room_name + "," + integer;
	
	return room_name;
}
function search_rooms( searchStr  ){
	//list.find ( searchStr)
	//if found return roomid i.e. the value of the the key
}
function createRoom( room_name ){
	/*
	 * create a room and add this to the rooms list 
	 * return the room_id if successfull.
	 */
}
function tell_participants( rid, users){
	//socket send new room event 
}


//2nd method of the interface
function addUsers( rid, users ){
	//one way to go	:   retrieve the participants of the room and then add these to new ones and update the room
	//another way 	: 	keep a record of the users in each room, which increases the mem requirements 
	
	//anyways the final call will be update_room( room );
}



/* we will archieve the data after the class is over.
 * then it can be stored in the form 'from: user, to : users ' so as to avoid so many rooms
 */
