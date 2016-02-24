var $ = require('jquery-deferred')  ;

var res = {}  ;

res.init = function(){
	var _d = $.Deferred();
	/* 
	 * connect mongo
	 * connect redis 
	 * init stores 
	 * check if local db is ok(i.e. consistant)  _maybe_ 
	 * do things that are meant to be done at startup.. */

	_d.resolve();

	return _d.promise();
};

/* 
 * we would want to do smth before shutdown */
res.release = function(){

};

module.exports = res ;
