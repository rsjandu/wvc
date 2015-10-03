/*
 * Test for getting session id and session token.
 * Make a Rest API call to schedule a class.
 * Get a token.
 * */

var uuid = require('node-uuid');
var rest = require('restler');
var logger = require('./../lib/logger.js');
var log = logger.getLogger('testClient');


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

requestToken = function requestToken(classId, mediaRoomId, userRole, userName) {
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

function getRandomName() {
  return 'User-' + getRandomInt(1, 1000);
}

exports.getToken = function getToken(classId, mediaRoomId, userRole, userName) {
  requestToken(classId, null, 'moderator', getRandomName());
};

