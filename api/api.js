var fs      = require('fs');
var path    = require('path');
var moment = require('moment'); 
var imgPath = path.join(__dirname, '../public/img/');
var logPath = path.join(__dirname, '../log/');
var utils = require('../config/utils');
var LogController = require('../controllers/logController').LogController;
var IpController = require('../controllers/ipController').IpController;

var logController = new LogController();
var ipController = new IpController();

/** set nodelog **/
var setNodelog = function(req, res) {
    
    res.set('Content-Type', 'application/json');

    var jsonObjLog = {};
    var jsonObjIp = {};

    console.log('------------------- GET - api setNodelog - public --------------------- ');
    
    jsonObjLog.client_id = req.query.u;
    jsonObjLog.day = moment().format("YYYYMMDD");
    jsonObjLog.location = req.query.l;
    jsonObjLog.referrer = req.query.r;
    jsonObjLog.width = req.query.w;
    jsonObjLog.height = req.query.h;
    jsonObjLog.user_agent = req.query.a;
    jsonObjLog.history_length = req.query.hl;
    jsonObjLog.client_ip = utils.getClientIp(req);
    //console.log(jsonObjLog);
    
    logController.save(jsonObjLog, function(err, logRes){
        if (err) console.log(err);
        
        /** check for unique IP address **/
        var day = moment().format("YYYYMMDD");
        
        logController.existIpAddressInDay(logRes, function(err, logRes2){
            
                if (logRes2.length == 1) {
                    console.log('INCREMENT - first access for IP ' + jsonObjLog.client_ip + ' in day ' + jsonObjLog.day + ' for client_id ' + jsonObjLog.client_id);
                    
                    jsonObjIp.day = jsonObjLog.day;
                    jsonObjIp.client_id = jsonObjLog.client_id;
                    
                    ipController.save(jsonObjIp, function(err, ipRes){
                        if (err) console.log(err);
                        console.log(ipRes);
                    });    
                }
                else    
                    console.log('NOT INCREMENT - ip ' + jsonObjLog.client_ip + ' already exist in day ' + jsonObjLog.day + ' for client_id ' + jsonObjLog.client_id);
            
            });  
        });     
    
    
    res.set('Content-Type', 'image/gif');
    res.sendfile(imgPath + '1.gif');
};

/** get getUniqueIpAddress **/
var getUniqueIpAddress = function(req, res) {
   
    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    
    console.log('------------------- GET - api getUniqueIpAddress - public --------------------- ');
    
    logController.getUniqueIpAddress(function(err, logs){
        if (err) {
            jsonObj.success = false;
            jsonObj.error = err;
            res.send(jsonObj);
            console.log(jsonObj.error);
        } else {
            if (logs.length != 0) {
                res.send(JSON.stringify(logs));
                console.log('Logs: ' + JSON.stringify(logs));
            }
            else {
                jsonObj.success = false;
                jsonObj.error = 'No logs found';
                res.send(jsonObj);
                console.log(jsonObj.error);
            }
        }
    })    
};


/** exports **/
exports.setNodelog = setNodelog;
exports.getUniqueIpAddress = getUniqueIpAddress;