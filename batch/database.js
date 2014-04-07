var MongoClient = require('mongodb').MongoClient
var config = require('../config/config');
var moment  = require('moment'); 

var connstring = 'mongodb://' + config.mongo.user + ':' + config.mongo.password + '@' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.db;

/** set nodelog **/
var cleanDB = function() {
    MongoClient.connect(connstring, function(err, db) {
        console.log('>>> COMPACT DATA BASE');
        if(err) console.dir(err);
        else    {
            var day = moment().format("YYYYMMDD");
            db.collection('logs').remove( {day: {$ne: day}} , function(err, result) {
                console.log('>>> delete result ' + JSON.stringify(result));
                db.command({repairDatabase:1}, function(err, result) {
                    console.log('>>> compact result ' + JSON.stringify(result));
                    db.close();
                });
            });
            /* find examples
            db.collection('logs')
                .find({})
                .limit(10)
                .toArray(function(err, logs) {
                    console.dir(logs);
                    db.close();
            });
            */
        }
    });
};    


/** exports **/
exports.cleanDB = cleanDB;