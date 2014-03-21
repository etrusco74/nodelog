var IpModel = require('../models/ipModel');

/** ip controller **/
IpController = function(){};

/** Create or Update unique ip data **/
IpController.prototype.save = function(json, callback) {
    
    IpModel.findOne({ $and: [{client_id:json.client_id}, {day:json.day}] }, function (err, ip) {
      if (err)      callback(err.message, null)
      else  {
          if(ip != null){
            ip.num = ip.num + 1;
            ip.save(function(err, ipRes){
                if (err)     callback(err.message, null)
                else 		{
                    callback(null, ipRes);
                }
            });
        }
        else{
            json.num = 1;
            var ip = new IpModel(json);  
            ip.save(function (err, ipRes) {
                if (err)     callback(err.message, null)
                else 		{
                    callback(null, ipRes);
                }
            });    
        }
      }
      
    });
    
};

/** Get unique access count **/
IpController.prototype.get = function(json, callback) {
    
    IpModel.findOne({ $and: [{client_id:json.client_id}, {day:json.day}] }, function (err, ip) {
      if (err)      callback(err.message, null)
      else          callback(null, ip);
    });
    
};

/** exports **/
exports.IpController = IpController;