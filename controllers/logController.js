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

/** best page in day **/
LogController.prototype.bestPageInDay = function(json, callback) {
    
    LogModel.aggregate(
    { 
        $match: { $and: [{client_id:json.client_id}, {day:json.day}]}
    },    
    { 
        $group: { _id: { href: '$location.href', page: '$location.page' }, total_view: { $sum: 1 } }
    },
    {
        $sort: {total_view:-1}
    },
    function (err, res) {
        if (err)      callback(err.message, null)
        else  {        
            var maxValues = [];
            for (var i = 0; i < 10; i++) {
                var object = res[i];
                maxValues.push(object);
            }
            callback(null, maxValues);
        }    
    });
    
};

/** exports **/
exports.LogController = LogController;