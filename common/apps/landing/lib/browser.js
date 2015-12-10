var log       = require('landing/common/log');

var browser = {};

browser.check_compatibility = function (req, res, next) {

	/*
	 * If the browser check is not done, then redirect to the browser
	 * check page, else pass through */
	log.info ('req.cookie = ', JSON.stringify(req.cookies, null, 2));
	var check = req.cookies.wiziq_bc;

	if (!check) {
		res.cookie('wiziq_bc_redirect', req.originalUrl);
		return res.render('../views/browser-check');
	}

	next();
};

module.exports = browser;
