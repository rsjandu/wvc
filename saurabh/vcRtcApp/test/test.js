/*
 * Test for getting session id and session token.
 * Make a Rest API call to schedule a class.
 * Get a token.
 * */

'use strict';

var uuid = require('node-uuid');
var rest = require('restler');
var logger = require('./../lib/logger.js');
var log = logger.getLogger('testClient');
var token = require('./token');
var config = require('./../conf/roomconfig');
var random = require('./random');


var requestToken = function requestToken(classId, mediaRoomId, userRole, userName) {
  var jsonData = {
    data: {
      classId : classId,
      mediaRoomId : mediaRoomId,
      userRole : userRole,
      userName : userName
    }
  };
  rest.post('http://192.168.56.101:8080/rooms/token',
      jsonData)
    .on('complete', function(result) {
      if (result instanceof Error) {
        console.log('Error:', result.message);
      } else {
        console.log(result);
      }
    });

};


var TEST_USER_LIMIT = config.general.userLimit + 6;
function getNTokens (classId) {
  console.log('ClassId: ' + classId);
  console.log('************* TEST_USER_LIMIT : ' + TEST_USER_LIMIT);
  for ( var i = 0; i < TEST_USER_LIMIT ; ++i )
  {
    token.getToken(classId, null, 'moderator', random.getName());
  }
}


var jsonData = {
  data: {
    classId : uuid.v4(),
    userRole : 'moderator',
    ownerName : random.getName(),
    roomName : random.getRoomName()
  }
};

rest.post('http://192.168.56.101:8080/rooms',
    jsonData)
.on('complete', function(result) {
  if (result instanceof Error) {
    console.log('Error:', result.message);
  } else {
    console.log(result);
    console.log(result.classId);
    getNTokens(result.classId);
  }
});

