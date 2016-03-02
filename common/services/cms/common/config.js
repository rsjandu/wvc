var config = {};

config.mongo = 'mongodb://localhost/cms';

config.s3 = {
	key 	: '_use_your_key_',
	secret 	: '_use_your_secret_',
	bucket	: 'boxcontent',
	dir		: 'vc-test'
};

module.exports = config ;
