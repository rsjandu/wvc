var server = require('http').createServer();
var url = require('url');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ 
				server: server,
				verifyClient : verify
});
var express = require('express');
var app = express();
var log = require("../common/log");
var config = require("../config");
