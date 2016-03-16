define(function(require) {
	var $          = require('jquery');
	var log        = require('log')('tab-controller', 'info');

	var m = {};
	var controller = null;
	var controller_initizlied = false;
	var pending_list = {};
	var active_list = {};

	/*
	 * This method just registers the controller */
	m.register_controller = function (_module) {
		var err = null;

		/* 
		 * Check to see if the module has all the mandatory 
		 * methods */
		err = check_controller_methods (_module);
		if (err)
			return err;

		controller = _module;
		return null;
	};

	/*
	 * Called by the framework, immediately after the successfull
	 * init of the resource acting as the tab-controller */
	m.flush_pending_registrations = function () {

		controller_initizlied = true;

		/* Register all the pending modules */
		for (var mod_name in pending_list) {

			m.register (pending_list[mod_name]);
			/*
			 * We ignore the errors - just print a message and that's that */
			active_list[mod_name] = pending_list[mod_name];
			delete pending_list[mod_name];
		}
	};

	/*
	 * This method registers the tab-user modules. Note, that this 
	 * method is not explicitly called by the module, but by the framework
	 * on behalf of the module during layout attacm process, based upon the 
	 * "display_spec" declaration of the module in the class_config. It will
	 * be called before the registering module itself initializes. */
	m.register = function (_module) {

		/* 
		 * Check to see if the module has all the mandatory 
		 * methods */
		err = check_methods (_module);
		if (err)
			return err;

		/*
		 * If no controller has been registered so far, then just
		 * add it in the pending list and leave */
		if (!controller || !controller_initizlied) {
			pending_list[_module.name] = _module;
			log.info ('registeration of "' + _module.name + '" pending until a controller registers');
			return;
		}

		var methods = {
			create : _module.handle.create,
		};
		var err = controller.handle.register (_module.name, _module.resource, methods);

		if (err)
			return err;

		active_list[_module.name] = _module;
		return null;
	};

	m.api = function (mod_name) {
		return {
			module_name : mod_name,
			create      : create,
			get_by_uuid : get_by_uuid,
			/*
			 * implement later 
			 destroy : destroy,
			 show : show,
			 enable : enable,
			 disable : disable,
			 save : save,
			 */
		};
	};

	var uuid_array = {};
	function get_by_uuid (uuid) {
		return uuid_array [uuid];
	}

	function create (options) {
		var mod_name = this.module_name;

		if (!controller) {
			log.error ('create: no registerd controller');
			return;
		}

		if (!options)
			options = {};
		/*
		 * If the caller provided a uuid,then do not override */
		if (!options.uuid)
			options.uuid = uuid();

		var res = controller.handle.create (mod_name, options);

		/* Ensure that "res" contains the required fields */
		if ((typeof res.id === 'undefined') ||
			(typeof res.anchor === 'undefined')) {
			log.error ('create: improper return value ', res);
		}

		uuid_array [ options.uuid ] = res;
		return res;
	}

	function check_controller_methods (_module) {

		try {
			__check(_module.name, 'register', _module.handle.register);
			__check(_module.name, 'create', _module.handle.create);
		}
		catch (err) {
			log.error (err);
			return err;
		}

		return null;
	}

	function check_methods (_module) {

		try {
			__check(_module.name, 'create', _module.handle.create);
		}
		catch (err) {
			log.error (err);
			return err;
		}

		return null;
	}

	function __check (mod_name, method_name, method) {

		if (typeof method === 'undefined') {
			var err = 'undefined "' + method_name + '" method for "' + mod_name + '", required by tab-controller';
			throw err;
		}
	}

	function uuid () {
		var d = new Date().getTime();
		if(window.performance && typeof window.performance.now === "function"){
			d += performance.now(); //use high-precision timer if available
		}
		var _u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return _u;
	}

	return m;
});

