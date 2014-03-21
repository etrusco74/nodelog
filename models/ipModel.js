var mongoose = require('mongoose');

/** IP Model **/
var ipSchema = mongoose.Schema({
    
    client_id 			:  	{ type: String, required: true},
    day                 :  	{ type: String, required: true},
	num 				:   Number
	
});

ipSchema.plugin(require('mongoose-eventify'));

var IpModel = mongoose.model('Ip', ipSchema);

module.exports = IpModel;