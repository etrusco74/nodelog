var config = {}

config.mongo = {};
config.web = {};

/** mongohq **/
config.mongo.host = 'oceanic.mongohq.com';       
config.mongo.port = 10013;

config.mongo.db = 'nodelog';
config.mongo.user = 'etrusco'
config.mongo.password = 'sandrino';

config.web.port = process.env.PORT || 8080;
config.web.postmarkapi = 'bbcd8f40-9efc-42fd-9f4b-59e882557944';

module.exports = config;