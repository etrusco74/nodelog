var mongoose = require('mongoose');

/** Site Model **/
var siteSchema = mongoose.Schema({
    username_id         :  	{ type: mongoose.Schema.Types.ObjectId, required: true, ref:'User'},
    username            :   { type: String, ref:'User'},
    creation_date       :  	{ type: Date, required: true},
    website             :   { type: String, required: true },
    client_id           :   { type: String, required: true }
});

var SiteModel = mongoose.model('Site', siteSchema);

module.exports = SiteModel;