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
	var sessionjs	= null;
	var sessionhtml	= null;
	var sessioncpp	= null;
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
		$('#mode').val(data.mode);
		updateSessionOnModeChange();
	};


	code_editor.start = function (sess_info) {
		log.info('start shared editor');

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

						openSharejs(sharejs);

					});
				});
			});
		});
	};

	createAceTemplate = function (myinfo) {
		var aceObj = {};
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

	openSharejs = function (sharejs) {
		sharejs.open('pad1', 'text', 'http://localhost:8000/channel', function(error, doc) {
				aceDoc = doc;
				if (error){
					log.info("Error in opening Doc ::"+error);
				}
				else {
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
		require(['./ace/theme-'+theme], function () {
			editor.setTheme("ace/theme/"+theme);
		});
	};

	initializeMode = function (moder) {
		$("#mode").val(moder);
		require(['./ace/ext-modelist'], function () {
			modelist = ace_instance.require("ace/ext/modelist");
			filepath = "mode."+moder;
			modeChosen = modelist.getModeForPath(filepath).mode;
			sessionjs = ace_instance.createEditSession("", "ace/mode/javascript");
			sessionhtml = ace_instance.createEditSession("", "ace/mode/html");
			switch (moder){
				case "js":
					editor.setSession(sessionjs);
					break;
				case "html":
					editor.setSession(sessionhtml);
					break;
				case "cpp":
					sessioncpp = ace_instance.createEditSession("", modeChosen);
					editor.setSession(sessioncpp);
					break;
			};
		});
	};


	themeChanger = function (change) {
		var themer = $("#theme").val();
		var typeTheme = "";
		switch (themer) {
			case "monokai":
				typeTheme = "monokai";
				break;
			case "solar_dark":
				typeTheme = "solarized_dark";
				break;
			case "chrome":
				typeTheme = "chrome";
				break;
			case "clouds":
				typeTheme = "clouds";
				break;
			case "clouds2":
				typeTheme = "clouds_midnight";
				break;
		}
		require (['./ace/theme-'+typeTheme], function () {
			editor.setTheme("ace/theme/"+ typeTheme);
		});
	};

	modeChanger = function (change) {
		updateSessionOnModeChange();
		data = {
			mode: $('#mode').val(),
		};
		c_handle.send_info(null, 'modeChange', data);
	};

	updateSessionOnModeChange = function () {
		var coder = $('#mode').val();
		var code = editor.getSession().getValue();
		fileType = coder;
		filepath = "mode."+coder;
		modeChosen = modelist.getModeForPath(filepath).mode;
		switch (coder){
			case "js":
				/*if(sessionjs === null){
				  sessionjs = ace_instance.createEditSession(code, modeChosen);
				  }*/
				editor.setSession(sessionjs);
				break;
			case "html":
				/*if(sessionhtml === null){
				  sessionhtml = ace_instance.createEditSession(code, modeChosen);
				  }*/
				editor.setSession(sessionhtml);
				break;
			case "cpp":
				if(sessioncpp === null){
					sessioncpp = ace_instance.createEditSession(code, modeChosen);
				}
				editor.setSession(sessioncpp);
				break;
		};
		editor.session.setValue(code);
		aceDoc.detach_ace();
		aceDoc.attach_ace(editor);
	};


	fontSizeChanger = function (change) {
		var sizer = $('#ace-fontSize').val();
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
