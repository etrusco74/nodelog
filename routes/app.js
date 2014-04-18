var utils = require('../config/utils');
var config = require('../config/config');

var dashboard = function(req, res) {
    
    console.log('-- route dashboard --');
    
    res.header("Content-Type", "text/html");
    
    res.render('app/dashboard',  { client_id: req.params.client_id });
}

var stat = function(req, res) {
    
    console.log('-- route stat --');
    
    res.header("Content-Type", "text/html");
    
    res.render('app/stat',  { client_id: req.params.client_id });
}

/** exports **/
exports.dashboard = dashboard;
exports.stat = stat;