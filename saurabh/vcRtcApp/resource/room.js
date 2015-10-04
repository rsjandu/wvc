'use strict';

var config = require('./../conf/roomconfig');

function Room(id, mediaRoomId, roomName, roomOwner) {
  this.id = id;
  this.mediaRoomId = mediaRoomId;
  this.name = roomName || 'DemoRoom';
  this.owner = roomOwner || 'xyz';
  this.userIds = [];
  this.status = 'available';
  this.config = config.general;
}

Room.prototype.addUser = function(userID) {
  if ( this.status === 'available' ) {
    this.user.push(userID);
  }
};

Room.prototype.removeUser = function(user) {
  var userIndex = -1;
  for ( var i = 0; i < this.user.length; i++ ) {
    if ( this.user[i].id === user.id ) {
      userIndex = i;
      break;
    }
  }
  this.user.remove(userIndex);
};

Room.prototype.getUser = function(userID) {
  var user = null;
  for ( var i = 0; i < this.user.length; i++ ) {
    if ( this.user[i].id == userID ) {
      user = this.user[i];
      break;
    }
  }
  return user;
};

Room.prototype.isAvailable = function() {
  return this.available === 'available';
};


module.exports = Room;
