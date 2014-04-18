var moment  = require('moment'); 
var StatModel = require('../models/statModel');

/** stat controller **/
StatController = function(){};

/** Create or Update stat data **/
StatController.prototype.save = function(json, callback) {
    
    StatModel.findOne({ $and: [{client_id:json.client_id}, {day:json.day}] }, function (err, stat) {
      if (err)      callback(err.message, null)
      else  {
          if(stat != null){
            (json.first_access) ? stat.uniqueAccess = stat.uniqueAccess + 1 : stat.uniqueAccess;
            stat.stat_date = json.stat_date;
            stat.pageView = stat.pageView + 1;
            stat.bestPages = json.bestPages;
            stat.save(function(err, statRes){
                if (err)     callback(err.message, null)
                else 		{
                    callback(null, statRes);
                }
            });
        }
        else{
            json.uniqueAccess = 1;
            json.pageView = 1;
            var stat = new StatModel(json);  
            stat.save(function (err, statRes) {
                if (err)     callback(err.message, null)
                else 		{
                    callback(null, statRes);
                }
            });    
        }
      }
      
    });
    
};

/** Get stat data for client_id and day **/
StatController.prototype.get = function(json, callback) {
    
    StatModel.findOne({ $and: [{client_id:json.client_id}, {day:json.day}] }, function (err, stat) {
      if (err)      callback(err.message, null)
      else          callback(null, stat);
    });
    
};

/** Get daily unique access for client_id **/
StatController.prototype.getDailyUniqueAccess = function(params, callback) {
    
    var start = moment().utc().subtract('days', params.day);
    StatModel.find({'client_id': params.client_id})
        .select('day uniqueAccess')
        .sort('day')
        .where('stat_date').gte(start)
        .exec(function (err, stats) {
            if (err)    callback(err.message, null)
            else {
                if (stats != null)  callback(null, stats);
                else                callback('Daily stats not found', null);
            }
        });    
}

/** Get daily page view for client_id **/
StatController.prototype.getDailyPageView = function(params, callback) {
    
    var start = moment().utc().subtract('days', params.day);
    StatModel.find({'client_id': params.client_id})
        .select('day pageView')
        .sort('day')
        .where('stat_date').gte(start)
        .exec(function (err, stats) {
            if (err)    callback(err.message, null)
            else {
                if (stats != null)  callback(null, stats);
                else                callback('Daily stats not found', null);
            }
        });    
}

/** exports **/
exports.StatController = StatController;