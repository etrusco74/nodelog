var utils = require('../config/utils');
var config = require('../config/config');

var root = function(req, res) {
    
    console.log('-- route index --');
    
    res.header("Content-Type", "text/html");
    
    res.render('app/index',  { client_id: req.params.client_id });
}

/** exports **/
exports.root = root;