var mongoose = require('mongoose');

/** Site Model **/
var siteSchema = mongoose.Schema({
    
    client_id           :   { type: String, required: true },
    username            :   { type: String, ref:'User'},
    creation_date       :  	{ type: Date, required: true},
    website             :   { type: String, required: true },
    tag                 :   { type: String, required: true }
    
});

var SiteModel = mongoose.model('Site', siteSchema);

module.exports = SiteModel;