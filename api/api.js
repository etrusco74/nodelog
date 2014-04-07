var fs      = require('fs');
var path    = require('path');
var url     = require('url');
var queryString = require('querystring');
var useragent = require('useragent');
var moment  = require('moment'); 
var rest = require('restler');

var imgPath = path.join(__dirname, '../public/css/img/');
var logPath = path.join(__dirname, '../log/');
var utils   = require('../config/utils');
var LogController = require('../controllers/logController').LogController;
var StatController = require('../controllers/statController').StatController;

var logController = new LogController();
var statController = new StatController();

/** set nodelog **/
var setNodelog = function(req, res) {
    
    res.set('Content-Type', 'application/json');

    var jsonObjLog = {};
    var location = {};
    var referrer = {};
    var jsonObjStat = {};
    var queryParams = {};

    console.log('------------------- GET - api setNodelog - public --------------------- ');
    
    jsonObjLog.client_id = req.query.u;
    jsonObjLog.day = moment().format("YYYYMMDD");
    
    var locationUrl         = url.parse(req.query.l, true);
    location.href           = locationUrl.href;
    location.protocol       = locationUrl.protocol;
    location.host           = locationUrl.host;
    location.search         = locationUrl.search;
    location.queryParams    = queryString.parse(location.search.replace(/^.*\?/, ''));  
    location.pathname       = locationUrl.pathname;
    location.page           = utils.getPageUrl(locationUrl);
    jsonObjLog.location     = location;
    
    var referrerUrl         = url.parse(req.query.r, true);
    referrer.href           = referrerUrl.href;
    referrer.protocol       = referrerUrl.protocol;
    referrer.host           = referrerUrl.host;
    referrer.search         = referrerUrl.search;
    referrer.queryParams    = queryString.parse(referrer.search.replace(/^.*\?/, ''));  
    referrer.pathname       = referrerUrl.pathname;
    referrer.page           = utils.getPageUrl(referrerUrl);
    jsonObjLog.referrer     = referrer;
    
    jsonObjLog.width = req.query.w;
    jsonObjLog.height = req.query.h;
    jsonObjLog.user_agent = req.query.a;
    
    var agent = useragent.parse(req.query.a);
    jsonObjLog.agent            = agent.toAgent();                
	jsonObjLog.operating_system = agent.os.toString();        
	jsonObjLog.device           = agent.device.toString();             
	
    jsonObjLog.history_length = req.query.hl;
    jsonObjLog.client_ip = utils.getClientIp(req);
    
    /** async callback **/
    /*
    logController.deleteOldLog(jsonObjLog, function(err, logRes){
        if (err) console.log(err);
        console.log('>>> delete : ' + JSON.stringify(logRes));
    });
    */
    
    var rest_url = 'http://freegeoip.net/json/' + jsonObjLog.client_ip;
    rest.get(rest_url).on('complete', function(data) {
        console.log('GEO IP ' + JSON.stringify(data)); // auto convert to object
        jsonObjLog.geo_ip = data;
        
        //console.log(jsonObjLog);
        
        logController.save(jsonObjLog, function(err, logRes){
            if (err) console.log(err);
            
            /** check for unique IP address **/
            var day = moment().format("YYYYMMDD");
            
            logController.bestPageInDay(logRes, function(err, bestPages){
                console.log('>>> best page : ' + JSON.stringify(bestPages));
            
                logController.existIpAddressInDay(logRes, function(err, logRes2){
                    
                        jsonObjStat.day = jsonObjLog.day;
                        jsonObjStat.client_id = jsonObjLog.client_id;
                        jsonObjStat.bestPages = bestPages;
                            
                        if (logRes2.length == 1) {
                            console.log('INCREMENT - first access for IP ' + jsonObjLog.client_ip + ' in day ' + jsonObjLog.day + ' for client_id ' + jsonObjLog.client_id);
                            jsonObjStat.first_access = true;
                            statController.save(jsonObjStat, function(err, statRes){
                                if (err) console.log(err);
                                console.log(statRes);
                            });    
                        }
                        else    {
                            console.log('NOT INCREMENT - ip ' + jsonObjLog.client_ip + ' already exist in day ' + jsonObjLog.day + ' for client_id ' + jsonObjLog.client_id);
                            jsonObjStat.first_access = false;
                            statController.save(jsonObjStat, function(err, statRes){
                                if (err) console.log(err);
                                console.log(statRes);
                            });  
                        }
                    
                    });  
                });     
        });
        
        res.set('Content-Type', 'image/gif');
        res.sendfile(imgPath + '1.gif');
    
    });
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