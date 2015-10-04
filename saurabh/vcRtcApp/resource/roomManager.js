var util = require('util');
var uuid = require('node-uuid');
var OpenTok = require('opentok');
var config = require('./../conf/roomconfig');
var Room = require('./room');
var User = require('./user');
var UserManager = require('./userManager');
var logger = require('./../lib/logger.js');

var log = logger.getLogger('vcRtcApp');

/*------------------------------------------
 */

var getApiKey = function getApiKey() {
  return config.opentok.apiKey;
};

var getApiSecret = function getApiSecret() {
  return config.opentok.apiSecret;
};

var opentok = new OpenTok(getApiKey(), getApiSecret());

var tokboxSessionId = '2_MX40NTM0MzAxMn5-MTQ0MjQyOTg4NzEyN35yclFBQ1RzVUkreVFhSUYwZFJ2eFJPd1l-fg';


/*
 *  TODO: Will be replaced later by a storage like redis.
 */
var roomsDB = new Map();

/* TODO for test purpose only */
var numUsers = 0;

var roomCreated = false;

function isPresenter(userRole) {
  if ( userRole === config.general.presenter || userRole === config.general.moderator ) {
    return true;
  }
  return false;
}

var maxUsersReached = function maxUsersReached(numUsers) {
  return  ( numUsers >= config.general.userLimit ) ? true : false;
};

function isRoomCreated () {
  return roomCreated;
}

function setRoomCreated () {
  roomCreated = true;
}

function authorizedToCreateSession(req) {
  return isPresenter(req.body.userRole);
}

var sessionExists = function sessionExist(classId) {
  return roomsDB.has(classId);
};

exports.getRoom = function getRoom(req, res) {
  log.info('getRoom API called. req.body %s', JSON.stringify(req.body));
  var sendRoomResponse = function(apiKey, classid, sessionid) {
    var data = {
      classId : classid,
      mediaRoomId : sessionid,
      k : apiKey
    };
    return res.json(data);
  };

  var classId = req.body.classId;
  roomsDB.forEach( function (value, key, map) {
    var _classid = key;
    var _roomid = value.mediaRoomId;
    return sendRoomResponse(getApiKey(), _classid, _roomid);
  });
};

/*
 * Create a room.
 * Request params:
 *  classId - mandatory
 *  userRole - mandatory
 *  ownerName - optional
 *  roomName - optional
 * Response:
 *  classId
 *  mediaRoomId - mandatory
 *  apiKey - ? required
 */
exports.createRoom = function createRoom(req, res) {
  log.info('createRoom API called. req.body %s', JSON.stringify(req.body));
  var sendRoomResponse = function(apiKey, classId, sessionId) {
    var data = {
      classId : classId,
      mediaRoomId : sessionId,
      apiKey : apiKey
    };
    return res.json(data);
  };

  if ( !authorizedToCreateSession(req) ) {
    log.info('unauthorizedToCreateSession.');
    return res.status(403).send('Permission denied');
  }

  var classId;
  if ( roomsDB.size === 1 ) {
    classId = req.body.classId;
    if ( classId ) {
      if ( sessionExists(classId) ) {
        return sendRoomResponse(getApiKey(), classId, roomsDB[classId].mediaRoomId);
      }
    } else {
      roomsDB.forEach( function (value, key, map) {
        var _classid = key;
        var _roomid = value.mediaRoomId;
        return sendRoomResponse(getApiKey(), _classid, _roomid);
      });
    }
  } else {
    if ( tokboxSessionId ) {
      classId = req.body.classId || generateClassId(req);
      log.debug('@@@@@@@@@@@@@@@@@@@@@@ Room DB size: ' + roomsDB.size);
      if ( roomsDB.size === 1 ) {
        roomsDB.clear();
      }
      var room = new Room(classId, tokboxSessionId, req.body.roomName, req.body.ownerName);
      roomsDB.set(classId, room);
      console.log('New room store:' + JSON.stringify(room));
      return sendRoomResponse(getApiKey(), classId, tokboxSessionId);
    }
    opentok.createSession( { mediaMode: 'routed' } , function(err, session) {
      if ( err ) {
        log.info("createSession API fail. err: %s", err);
        return res.status(500).send('createSession failed.');
      }
      var room = new Room(classId, session.sessionId, req.body.roomName, req.body.ownerName);
      roomsDB.set(classId, room);
      tokboxSessionId = session.sessionId;
      log.info("sessionid %s", session.sessionId);
      return sendRoomResponse(getApiKey(), session.sessionId);
    });
  }
};

var generateClassId = function generateClassId(req) {
  return ( req.body.classId ) ?
    req.body.classId :
    uuid.v4();
};

/*
 * Get Room.
 */
exports.getRoom = function(req, res) {
};

/*
 * Delete Room.
 * Removes from DB.
 */
exports.deleteRoom = function(req, res) {
  if ( roomsDB.has(req.body.classId) ) {
    roomsDB.delete(req.body.classId);
    res.send('Room deleted');
  } else {
    log.debug('Not found ClassId: ' + req.body.classId);
    return res.status(404).send('room not found.');
  }
};

var getMediaRoomId = function getMediaRoomId(classId) {
  var mediaRoomId = null;
  if ( roomsDB.has(classId) ) {
    var room = roomsDB.get(classId);
    mediaRoomId = room.mediaRoomId;
  }
  console.log('Media RoomId: ' + mediaRoomId);
  return mediaRoomId;
};

var getRoom = function getMediaRoomId(classId) {
  if ( roomsDB.has(classId) ) {
    return roomsDB.get(classId);
  }
};

/*
 * Create a token for a user.
 * Save in DB
 * Request params
 * classId - mandatory
 * mediaRoomId - optional. lookup from DB.
 * userRole - mandatory
 * userName - optional
 */
exports.createToken = function (req, res) {
  var classId = req.body.classId;
  log.info('createToken API called. req.body %s', JSON.stringify(req.body));
  var sendTokenResponse = function (token, userId) {
    var data = {
      classId : classId,
      mediaRoomId : req.body.mediaRoomId,
      k : getApiKey(),
      t : token,
      userId : userId
    };
    return res.json(data);
  };
  console.log('req.body.classId: ' +  classId);

  if ( !sessionExists(classId) ) {
    return res.status(404).send('ClassId not found.');
  }

  var room = getRoom(classId);

  if ( maxUsersReached(room.userIds.length) ) {
    return res.status(403).send('Permission Denied. Max user limit reached.');
  }

  var tokenOptions = {
    role : getRole(req.body.userRole),
    expireTime : getTokenExpiry(),
    data : req.body.userName
  };

  var mediaRoomId = room.mediaRoomId || req.body.mediaRoomId;

  var tokenId = opentok.generateToken(mediaRoomId, tokenOptions);

  if ( tokenId ) {
    var userId = uuid.v4();
    room.userIds.push(userId);
    sendTokenResponse(tokenId, userId);
  } else {
    return res.status(500).send('Server Internal Error. No room token.');
  }
};

/*
 * In the function below, we are not restricting a token value of a user to subscriber only.
 * The role for the token. Each role defines a set of permissions granted to the token:
 * 'subscriber' — A subscriber can only subscribe to streams.
 *  'publisher' — A publisher can publish streams, subscribe to streams, and signal. (This is the default value if you do not specify a role.)
 *  'moderator' — In addition to the privileges granted to a publisher, a moderator can call the forceUnpublish() and forceDisconnect() method of the Session object.
 *
 * */
var getRole = function getRole(role) {
  return isPresenter(role) ? 'moderator' : 'publisher';
};

var getTokenExpiry = function getTokenExpiry() {
  return (new Date().getTime() / 1000) + config.general.activeSessionTime;
};

