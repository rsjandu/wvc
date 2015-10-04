// configure your variables here

var roomconfig = {};

roomconfig.opentok = {};
roomconfig.db = {};

// OpenTok Credentials
roomconfig.opentok.apiKey = process.env.TB_KEY || '45343012';
roomconfig.opentok.apiSecret =  process.env.TB_SECRET || 'cf5bafc2af0fcc269bfb8e19b6def2d1558aa212';

// General class config. Can be extended later as much as required.
roomconfig.general = {
  presenter : 'presenter',
  moderator : 'moderator',
  maxNumModerators : 2,
  lockUnlock : false,
  userLimit : 1000,
  /* below are specific to AV session. */
  maxVideo : 6,
  confType :  'audiovideo',
  defaultPublish : false,
  defaultVideoRes : 'qcif',
  maxVideoRes : '640p',
  hdVideo : false,
  showStats : false,
  activeSessionTime: 1*60*60 // in seconds. default is 60 minute session
};


// Database configuration for saving on these room, session, user and tokenids.
// are you using redis ?
roomconfig.db.redis = false;
roomconfig.db.REDIS_URL = process.env.REDIS_URL;

module.exports = roomconfig;

