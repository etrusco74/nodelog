var config = {}

config.mongo = {};
config.web = {};

/** mongohq **/
config.mongo.host = 'oceanic.mongohq.com';       
config.mongo.port = 10013;

config.mongo.db = 'nodelog';
config.mongo.user = 'etrusco'
config.mongo.password = 'sandrino';

config.web.port = process.env.PORT || 80;

module.exports = config;