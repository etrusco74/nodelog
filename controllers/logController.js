var LogModel = require('../models/logModel');

/** log controller **/
LogController = function(){};

/** Create a new log by json data **/
LogController.prototype.save = function(json, callback) {
    
    var log = new LogModel(json);  
    
    log.save(function (err, logRes) {
        if (err)     callback(err.message, null)
        else 		{
            callback(null, logRes);
        }
    });    
    
};
exports.LogController = LogController;