define(function(require) {
	var $           = require('jquery');
	window.jade     = require('jade');
	var modernizer  = require('modernizer');
	var jquery_drag = require('jquery_drag');
	var jquerypp    = require('jquerypp');
	var jqbookblk   = require('bookblock');
	var log         = require('log')('flipboard-v1', 'info');
	var framework   = require('framework');

	var flipboard = {};
	var f_handle = framework.handle ('flipboard-v1');
	var canvas;
	var editor = {};
	//var mode = require('./ace/mode-javascript');
	//var ace = require('./ace_min');
	//var BCSocket = require('./bcsocket').BCSocket;
	//var sharejs = require('./share');
	

	flipboard.init = function (display_spec, custom, perms) {
		var _d = $.Deferred();

		var anchor = display_spec.anchor;
		var template = f_handle.template('v1');

		if (!template) {
			_d.reject ('flipboard-basic: template not found');
			return _d.promise ();
		}

		$(anchor).append(template({title: 'Flipboard'}));

		var page = Page();
		page.init ();

		canvas = $(anchor).find('canvas')[0];

		_d.resolve();
		return _d.promise();
	};

	var ctx;

	flipboard.start = function (sess_info) {

		//start_shared_text();
		start_shared_ide();
		//attach_editor();
		//ace_code_editor();
		$(function() {
			ctx = $(canvas)[0].getContext("2d");

			$(canvas).on('drag dragstart dragend', function(e) {
				offset = $(this).offset();
				data = {
					x: (e.clientX - offset.left),
					y: (e.clientY - offset.top),
					type: e.handleObj.type
				};
				draw(data);
				f_handle.send_info (null, 'draw', data);
			});
		});
	};

	flipboard.info = function (from, id, data) {
		if (id !== 'draw') {
			log.error ('bad info_id: \"' + id + '\"');
			return;
		}
		draw (data);
	};

	function attach_editor() {
		console.log('attach editor');
		require (['http://cdn.tinymce.com/4/tinymce.min.js'], function() {
				tinymce.init({
					selector: '#editor',
					theme: 'modern',
					width: 600,
					height: 300
				});
		});
	}

	function ace_code_editor() {
		log.info("ace code editor");
		require(['./ace/ace'], function (tmp) {
			require(['./ace/mode-javascript'], function (tmp2) {
				var elem = document.getElementById("ace_editor");
				editor = ace.edit(elem);
				require(['ace/mode/javascript'], function (mode) {
					editor.session.setMode(new (mode.Mode));
				});
			});
		});
	};

	function start_shared_ide() {
		console.log('start shared ide');
		//require(['http://ajaxorg.github.com/ace/build/src/ace.js'], function(tmp1) {
		require(['./ace/ace'], function() {
				require(['./bcsocket'], function() {
					//var socket = new BCSocket('http://localhost:7007/channel', {reconnect: true});
					//console.log(socket);
					require(['./share_uncompressed'], function () {
					require(['./ace'], function() {
						var elem = document.getElementById("ace_editor");
						editor = ace.edit(elem);
						//var session = editor.getSession();
						//session.setMode(new (mode.Mode));
						require(['./theme-idle_fingers'], function() {
							editor.setTheme("ace/theme/idle_fingers");
						});

						require(['./ace/mode-javascript'], function() {
							require(['ace/mode/javascript'], function (mode) {
								var session = editor.getSession();
								session.setMode(new (mode.Mode));
							});
						});
						
						/*var sjs = new sharejs.Connection(socket);
						var doc = sjs.get('users', 'seph');
						console.log(doc);
						doc.subscribe();
						doc.whenReady(function () {
							if(!doc.type){
								doc.create('text');
							}
							if(doc.type && doc.type.name === 'text'){
								console.log('doc ready, data: ', doc.getSnapshot());
								doc.attach_ace(editor);
							}
						});*/

						sharejs.open('hello', 'text', 'http://localhost:8000/channel' ,function(error, doc) {
							if (error){
								console.log("Error :"+error);
							}
							else{
								doc.attach_ace(editor);
								editor.setReadOnly(false);
							}
						});
					});});//});

				});
		});
	}

	function start_shared_text() {
		console.log('start shared text');
		var elem = document.getElementById("editor");
		
		require([ './bcsocket' ],function(){
			var socket = new BCSocket('http://localhost:7007/channel', {reconnect: true});
			console.log( socket);
			var sjs = new sharejs.Connection(socket);
			var doc = sjs.get('users', 'seph');
			console.log(doc);
			doc.subscribe();
			doc.whenReady(function () {
				if(!doc.type){
					doc.create('text');
				}
				if(doc.type && doc.type.name === 'text'){
					console.log('doc ready, data: ', doc.getSnapshot());
					doc.attachTextarea(elem);
				}
			});

			});
		/*var sjs = new sharejs.Connection(socket);
		var doc = sjs.get('users', 'seph');
		console.log(doc);
		doc.subscribe();
//		sharejs.open('hello', 'text', 'http://example.com:8000/channel', function(error, doc)  {
//				if(error){
//					console.log('ERROR:'+error);
//				}
//				else{
//					doc.subscribe();
					doc.whenReady(function () {
						if (!doc.type){
							doc.create('text');
						}
						if (doc.type && doc.type.name === 'text'){
							doc.attachTextarea(elem);
						}
					});
//				}
//		});*/
	}

	function draw (data) {

		if (data.type == "dragstart") {
			ctx.beginPath();
			ctx.moveTo(data.x,data.y);
		} else if (data.type == "drag") {
			ctx.lineTo(data.x,data.y);
			ctx.stroke();
		} else {
			ctx.stroke();
			ctx.closePath();
		}
	}

	function Page () {

		var config = {
			$bookBlock : $( '#bb-bookblock' ),
			$navNext : $( '#bb-nav-next' ),
			$navPrev : $( '#bb-nav-prev' ),
			$navFirst : $( '#bb-nav-first' ),
			$navLast : $( '#bb-nav-last' )
		},
		init = function() {
			config.$bookBlock.bookblock( {
				orientation: 'horizontal',
				speed : 700,
				shadowSides : 0.8,
				shadowFlip : 0.7
			} );
			initEvents();
		},
		initEvents = function() {

			var $slides = config.$bookBlock.children();

			// add navigation events
			config.$navNext.on( 'click touchstart', function() {
				setTimeout(function (){
					editor.resize(); 
				},1000);
				config.$bookBlock.bookblock( 'next' );
				return false;
			} );

			config.$navPrev.on( 'click touchstart', function() {
				setTimeout(function () {
					editor.resize();
				}, 1000);
				config.$bookBlock.bookblock( 'prev' );
				return false;
			} );

			config.$navFirst.on( 'click touchstart', function() {
				config.$bookBlock.bookblock( 'first' );
				return false;
			} );

			config.$navLast.on( 'click touchstart', function() {
				config.$bookBlock.bookblock( 'last' );
				return false;
			} );

			// add swipe events
			$slides.on( {
				'swipeleft' : function( event ) {
					config.$bookBlock.bookblock( 'next' );
					return false;
				},
				'swiperight' : function( event ) {
					config.$bookBlock.bookblock( 'prev' );
					return false;
				}
			} );

			// add keyboard events
			$( document ).keydown( function(e) {
				var keyCode = e.keyCode || e.which,
					arrow = {
					left : 37,
					up : 38,
					right : 39,
					down : 40
				};

				switch (keyCode) {
					case arrow.left:
						config.$bookBlock.bookblock( 'prev' );
					break;
					case arrow.right:
						config.$bookBlock.bookblock( 'next' );
					break;
				}
			} );
		};

		return { init : init };
	}

	return flipboard;

});
