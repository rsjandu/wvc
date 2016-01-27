define(function(require) {
	var $            = require('jquery');
	var framework    = require('framework');
	var log          = require('log')('code-editor', 'info');
	var editor       = {};
	var code_editor  = {};
	var c_handle     = framework.handle ('code-editor');
	var file_type    = "";
	var modelist     = {};
	var mode_chosen  = "";
	var session_type = {};
	var ace_instance = null;
	var ace_doc      = null;
	var ace_template;
	var anchor;

	code_editor.init = function(display_spec, custom, perms){
		var _d = $.Deferred();
		anchor = display_spec.anchor;
		ace_template = c_handle.template ( display_spec.templates[0] );
		_d.resolve();
		return _d.promise();
	};

	code_editor.info = function (from, id, data) {
		if (id !== 'mode_change') {
			log.error ('bad info_id: \"' + id + '\"');
			return;
		}
		log.info("broadcast info for language change received:::data::::"+JSON.stringify(data));
		$('#mode').val(data.mode);
		update_session_mode_change();
	};


	code_editor.start = function (sess_info) {
		log.info('start shared editor:::session_info:::'+ JSON.stringify(sess_info));

		create_ace_template(sess_info);                                    //Will create drop menu

		apply_event_listeners();

		require(['./ace/ace'], function () {

			require(['bcsocket'], function () {

				require(['share_uncompressed'], function () {

					require(['ace_share'], function () {
						
						var elem = document.getElementById("sce-ace_editor");
						ace_instance = ace;
						editor = ace_instance.edit(elem);
						editor.on("input", check_for_undo_redo);             //checks whether undo-redo stack are empty or not to set button disability
						editor.$blockScrolling = Infinity;

						initialize_editor_options();

						initialize_mode (sess_info.current_lang);

						initialize_theme(sess_info.current_theme);

						set_editor_key_binding();                            //set Ctrl-S for save and Ctrl-O for open

						open_sharejs(sharejs, sess_info.server_url);       //attach ace to sharejs document

					});
				});
			});
		});
	};

	/*
	 * Local functions */

	function create_ace_template (myinfo) {
		var aceobj = {};
		log.info("info received from session server ::"+ JSON.stringify(myinfo));
		aceobj.languages = myinfo.languages;
		aceobj.themes	= myinfo.themes;
		var ace_editor = ace_template(aceobj);
		$(anchor).append(ace_editor);
	}

	function apply_event_listeners () {
		$('#mode').on('change', mode_changer);
		$('#theme').on('change', theme_changer);
		$('#ace-font_size').on('change', font_size_changer);
		$('.ace_undo').on('click', undo_handler);
		$('.ace_redo').on('click', redo_handler);
		$('#sce-ace_editor').append('<h1> Loading... </h1>');
		$('#load_file').on('change', handle_file_select);
		$('#save_file').on('click', save_file_on_system);
		$.event.props.push( "dataTransfer" );
		$('#sce-ace_editor').on('dragover', handle_drag_over);
		$('#sce-ace_editor').on('drop', handle_drop);

	}

	function open_sharejs (sharejs, server_url) {
		log.info("server_url received::"+ server_url);
		sharejs.open('pad1', 'text', server_url+"/channel", function(error, doc) {
				ace_doc = doc;
				if (error){
					log.info("Error in opening Doc ::"+error);
				}
				else {
					log.info("successfully attached ace and sharejs");
					ace_doc.attach_ace(editor);
				}
			});
	}

	function initialize_editor_options () {	
		require(['./ace/ext-language_tools'], function () {
			ace_instance.require("ace/ext/language_tools");
			editor.setOptions({
				enableBasicAutocompletion: true,
				enableSnippets: true,
				enableLiveAutocompletion: true
			});
			log.info("editor options set");
		});		
	}

	function set_editor_key_binding () {
		editor.commands.addCommand({
			name: "save",
			bindKey: {win: "Ctrl-S", mac: "Command-S"},
			exec: function () {
				save_file_on_system();
			}
		});
		editor.commands.addCommand({
			name: "open",
			bindKey: {win: "Ctrl-O", mac: "Command-O"},
			exec: function () {
				document.getElementById("load_file").click();
			}
		});
	}

	function initialize_theme (theme) {
		log.info("Initialized Received theme ::"+theme);
		require(['./ace/theme-'+theme], function () {
			editor.setTheme("ace/theme/"+theme);
		});
	}

	function initialize_mode (mode_type) {
		$("#mode").val(mode_type);
		log.info("Initialize received mode ::"+ mode_type);
		require(['./ace/ext-modelist'], function () {
			modelist = ace_instance.require("ace/ext/modelist");
			file_type = mode_type;
			filepath = "mode."+mode_type;
			mode_chosen = modelist.getModeForPath(filepath).mode;

			/*
			 * Created session for the language that has syntax checker beforehand in order to load checker otherwise checker throws error  */
			session_type["js"] = ace_instance.createEditSession("", "ace/mode/javascript");
			session_type["html"] = ace_instance.createEditSession("", "ace/mode/html");
			
			if (session_type[mode_type]){
				editor.setSession(session_type[mode_type]);
			}
			else{
				session_type[mode_type] = ace_instance.createEditSession("", mode_chosen);
				editor.setSession(session_type[mode_type]);
			}
		});
	}


	function theme_changer (change) {
		var theme_type = $("#theme").val();
		log.info("Theme changed to ::"+ theme_type);
		require (['./ace/theme-'+theme_type], function () {
			editor.setTheme("ace/theme/"+ theme_type);
		});
	}

	function mode_changer (change) {
		update_session_mode_change();
		data = {
			mode: $('#mode').val(),
		};
		log.info("data sent ::"+ JSON.stringify(data));
		c_handle.send_info(null, 'mode_change', data);
	}

	function update_session_mode_change () {
		var mode_type = $('#mode').val();
		log.info("mode changed to ::"+mode_type);
		var code = editor.getSession().getValue();
		file_type = mode_type;
		filepath = "mode."+mode_type;
		mode_chosen = modelist.getModeForPath(filepath).mode;
		if(session_type[mode_type]){
			editor.setSession(session_type[mode_type]);
		}
		else{
			session_type[mode_type] = ace_instance.createEditSession("", mode_chosen);
			editor.setSession(session_type[mode_type]);
		}
		ace_doc.detach_ace();
		ace_doc.attach_ace(editor);
	}


	function font_size_changer (change) {
		var size = $('#ace-font_size').val();
		log.info("changed font size to ::"+ size);
		editor.setFontSize(Number(size));
	}

	function undo_handler () {
		var um = editor.getSession().getUndoManager();
		um.undo();
	}

	function redo_handler () {
		um = editor.getSession().getUndoManager();
		um.redo();
	}

	function check_for_undo_redo (change){
		var um = editor.getSession().getUndoManager();
		$('.ace_undo').attr('disabled', um.hasUndo() ? false : true );
		$('.ace_redo').attr('disabled', um.hasRedo() ? false : true );
	}

	function save_file_on_system () {
		var code  = editor.getSession().getValue();
		require(['./FileSaver'], function () {
			var blob = new Blob([code], {type:"text/plain;charset=utf-8"});
			log.info("Filetype to save as ::"+file_type);
			saveAs(blob, "code."+ file_type);
		});
	}

	function handle_file_select (evt) {
		var file = evt.target.files[0];
		var reader = new FileReader();
		reader.onload = function (f) {
			var code = f.target.result;
			editor.getSession().setValue(code);
		};
		reader.readAsText(file);
	}

	function handle_drag_over (evt) {
		evt.stopPropagation();
		evt.preventDefault ();
		evt.dataTransfer.dropEffect = "copy";
	}	

	function handle_drop (evt) {
		evt.stopPropagation();
		evt.preventDefault ();
		var files = evt.dataTransfer.files[0];
		var reader = new FileReader();
		reader.onload = function (f) {
			var code = f.target.result;
			editor.getSession().setValue(code);
		};
		reader.readAsText(files);
	}

	return code_editor;
});
