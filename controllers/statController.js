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

/** Get unique access count **/
StatController.prototype.get = function(json, callback) {
    
    StatModel.findOne({ $and: [{client_id:json.client_id}, {day:json.day}] }, function (err, stat) {
      if (err)      callback(err.message, null)
      else          callback(null, stat);
    });
    
};

/** exports **/
exports.StatController = StatController;