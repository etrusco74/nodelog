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

/** get unique ip address **/
LogController.prototype.getUniqueIpAddress = function(callback) {
    
    LogModel.aggregate({
    	    $group : { _id : "$client_ip", count : { $sum : 1 }}
    	}, 
    	function (err, logs)	{ 
    		if (err)  callback(err.message, null)
            else {
                if (logs != null)   callback(null, logs);
                else                callback('Logs not found', null);
            }
        }
    );
    /*
    LogModel.aggregate()
        .group({ _id: '$client_ip', count: { $sum : 1 } })
        .select('_id count')
        .exec(function (err, logs) {
            if (err)    callback(err.message, null)
            else {
                if (logs != null)   callback(null, logs);
                else                callback('Logs not found', null);
            }
        });
    */
};

/** exports **/
exports.LogController = LogController;