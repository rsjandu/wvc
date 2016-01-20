define(function(require) {
	var $ 			= require('jquery');
	var framework 	= require('framework');
	var log 		= require('log')('code-editor', 'info');
	var editor 		= {};
	var code_editor = {};
	var c_handle	= framework.handle ('code-editor');
	var fileName	= "";
	var fileType	= "js";
	var modelist	= {};
	var filePath	= "";
	var modeChosen	= "";
	var sessType	= {};
	var ace_instance = null;
	var aceDoc		= null;
	var aceTemplate;
	var anchor;

	code_editor.init = function(display_spec, custom, perms){
		var _d = $.Deferred();
		anchor = display_spec.anchor;
		aceTemplate = c_handle.template ( display_spec.templates[0] );
		_d.resolve();
		return _d.promise();
	};

	code_editor.info = function (from, id, data) {
		if (id !== 'modeChange') {
			log.error ('bad info_id: \"' + id + '\"');
			return;
		}
		log.info("broadcast info for language change received:::data::::"+JSON.stringify(data));
		$('#mode').val(data.mode);
		updateSessionOnModeChange();
	};


	code_editor.start = function (sess_info) {
		log.info('start shared editor:::session_info:::'+ JSON.stringify(sess_info));

		createAceTemplate(sess_info);

		applyEventListeners();

		require(['./ace/ace'], function () {

			require(['bcsocket'], function () {

				require(['share_uncompressed'], function () {

					require(['ace_share'], function () {
						var elem = document.getElementById("sce-ace_editor");
						ace_instance = ace;
						editor = ace_instance.edit(elem);
						editor.$blockScrolling = Infinity;

						intializeEditorOptions();

						initializeMode(sess_info.current_lang);

						initializeTheme(sess_info.current_theme);

						setEditorKeyBinding();

						openSharejs(sharejs, sess_info.server_url);

					});
				});
			});
		});
	};

	createAceTemplate = function (myinfo) {
		var aceObj = {};
		log.info("info received from session server ::"+ JSON.stringify(myinfo));
		aceObj.languages = myinfo.languages;
		aceObj.themes	= myinfo.themes;
		var aceEditor = aceTemplate(aceObj);
		$(anchor).append(aceEditor);
	};

	applyEventListeners = function () {
		$('#mode').on('change', modeChanger);
		$('#theme').on('change', themeChanger);
		$('#ace-fontSize').on('change', fontSizeChanger);
		$('.ace_undo').on('click', undoHandler);
		$('.ace_redo').on('click', redoHandler);
		$('#sce-ace_editor').append('<h1> Loading... </h1>');
		$('#loadFile').on('change', handleFileSelect);
		$('#saveFile').on('click', saveFileOnSystem);
		$.event.props.push( "dataTransfer" );
		$('#sce-ace_editor').on('dragover', handleDragOver);
		$('#sce-ace_editor').on('drop', handleDrop);

	};

	openSharejs = function (sharejs, server_url) {
		log.info("server_url received::"+ server_url);
		sharejs.open('pad1', 'text', server_url, function(error, doc) {
				aceDoc = doc;
				if (error){
					log.info("Error in opening Doc ::"+error);
				}
				else {
					log.info("successfully attached ace and sharejs");
					aceDoc.attach_ace(editor);
				}
				});
	};

	intializeEditorOptions = function () {	
		require(['./ace/ext-language_tools'], function () {
			ace_instance.require("ace/ext/language_tools");
			editor.setOptions({
				enableBasicAutocompletion: true,
				enableSnippets: true,
				enableLiveAutocompletion: true
			});
			log.info("editor options set");
		});		
	};

	setEditorKeyBinding = function () {
		editor.commands.addCommand({
			name: "save",
			bindKey: {win: "Ctrl-S", mac: "Command-S"},
			exec: function () {
				saveFileOnSystem();
			}
		});
		editor.commands.addCommand({
			name: "open",
			bindKey: {win: "Ctrl-O", mac: "Command-O"},
			exec: function () {
				document.getElementById("loadFile").click();
			}
		});
	};

	initializeTheme = function (theme) {
		log.info("Initialized Received theme ::"+theme);
		require(['./ace/theme-'+theme], function () {
			editor.setTheme("ace/theme/"+theme);
		});
	};

	initializeMode = function (moder) {
		$("#mode").val(moder);
		log.info("Initialize received mode ::"+ moder);
		require(['./ace/ext-modelist'], function () {
			modelist = ace_instance.require("ace/ext/modelist");
			filepath = "mode."+moder;
			modeChosen = modelist.getModeForPath(filepath).mode;
			sessType["js"] = ace_instance.createEditSession("", "ace/mode/javascript");
			sessType["html"] = ace_instance.createEditSession("", "ace/mode/html");
			
			if (sessType[moder]){
				editor.setSession(sessType[moder]);
			}
			else{
				sessType[moder] = ace_instance.createEditSession("", modeChosen);
				editor.setSession(sessType[moder]);
			}
		});
	};


	themeChanger = function (change) {
		var themer = $("#theme").val();
		log.info("Theme changed to ::"+ themer);
		require (['./ace/theme-'+themer], function () {
			editor.setTheme("ace/theme/"+ themer);
		});
	};

	modeChanger = function (change) {
		updateSessionOnModeChange();
		data = {
			mode: $('#mode').val(),
		};
		log.info("data sent ::"+ JSON.stringify(data));
		c_handle.send_info(null, 'modeChange', data);
	};

	updateSessionOnModeChange = function () {
		var coder = $('#mode').val();
		log.info("mode changed to ::"+coder);
		var code = editor.getSession().getValue();
		fileType = coder;
		filepath = "mode."+coder;
		modeChosen = modelist.getModeForPath(filepath).mode;
		if(sessType[coder]){
			editor.setSession(sessType[coder]);
		}
		else{
			sessType[coder] = ace_instance.createEditSession("", modeChosen);
			editor.setSession(sessType[coder]);
		}
		editor.session.setValue(code);
		aceDoc.detach_ace();
		aceDoc.attach_ace(editor);
		log.info("reattched ace with code ::"+code);
	};


	fontSizeChanger = function (change) {
		var sizer = $('#ace-fontSize').val();
		log.info("changed font size to ::"+ sizer);
		editor.setFontSize(Number(sizer));
	};

	undoHandler = function () {
		var um = editor.getSession().getUndoManager();
		log.info("1::"+um);
		um.undo();
		log.info("2::"+um);
		$('.ace_undo').attr('disabled', um.hasUndo() ? false : true );
	};

	redoHandler = function () {
		um = editor.getSession().getUndoManager();
		log.info("3::"+um);
		um.redo();
		$('.ace_redo').attr('disabled', um.hasRedo() ? false : true );
	};

	saveFileOnSystem = function () {
		var code  = editor.getSession().getValue();
		require(['./FileSaver'], function () {
			var blob = new Blob([code], {type:"text/plain;charset=utf-8"});
			log.info("Filetype to save as ::"+fileType);
			saveAs(blob, "code."+ fileType);
		});
	};

	handleFileSelect = function (evt) {
		var file = evt.target.files[0];
		var reader = new FileReader();
		reader.onload = function (f) {
			var code = f.target.result;
			editor.getSession().setValue(code);
		};
		reader.readAsText(file);
	};

	handleDragOver = function (evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = "copy";
	};	

	handleDrop = function (evt) {
		evt.stopPropagation();
		evt.preventDefault();
		var files = evt.dataTransfer.files[0];
		var reader = new FileReader();
		reader.onload = function (f) {
			var code = f.target.result;
			editor.getSession().setValue(code);
		};
		reader.readAsText(files);
	};

	return code_editor;
});
