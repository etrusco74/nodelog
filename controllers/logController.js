var LogModel = require('../models/logModel');

/** log controller **/
LogController = function(){};

/** Create new log row by json data **/
LogController.prototype.save = function(json, callback) {
    
    var log = new LogModel(json);  
    
    log.save(function (err, logRes) {
        if (err)     callback(err.message, null)
        else 		{
            callback(null, logRes);
        }
    });    
    
};

/** exist ip address in day **/
LogController.prototype.existIpAddressInDay = function(json, callback) {
    
    LogModel.find({ $and: [{client_id:json.client_id}, {client_ip:json.client_ip} , {day:json.day}] }, function (err, log) {
      if (err)      callback(err.message, null)
      else          callback(null, log)
    });
    
};

/** exports **/
exports.LogController = LogController;