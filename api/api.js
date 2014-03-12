var fs      = require('fs');
var path    = require('path');
var imgPath = path.join(__dirname, '../public/img/');
var logPath = path.join(__dirname, '../log/');
var utils = require('../config/utils');
var LogController = require('../controllers/logController').LogController;

var logController = new LogController();

/** get nodelog **/
var getNodelog = function(req, res) {
    
    var jsonObj = {};
    jsonObj.client_id = req.query.u;
    jsonObj.location = req.query.l;
    jsonObj.referrer = req.query.r;
    jsonObj.width = req.query.w;
    jsonObj.height = req.query.h;
    jsonObj.user_agent = req.query.a;
    jsonObj.history_length = req.query.hl;
    jsonObj.client_ip = utils.getClientIp(req);
    //console.log(jsonObj);
    
    /* write log file
    var log = fs.createWriteStream(logPath + "stream", {'flags': 'a'});
    log.write(JSON.stringify(jsonObj) + "\n");
    log.end();
    */
    
    logController.save(jsonObj, function(err, logRes){
        if (err) console.log(err);
    });
    
    res.set('Content-Type', 'image/gif');
    res.sendfile(imgPath + '1.gif');
};


/** exports **/
exports.getNodelog = getNodelog;