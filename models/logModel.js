var mongoose = require('mongoose');
var moment = require('moment'); 

/** Log Model **/
var logSchema = mongoose.Schema({
    
    log_date            :  	{ type: Date, required: true, default: moment()},
	client_id 			:  	{ type: String, required: true},
	location 			:   String,
	referrer 			:   String,
	width 				:   Number,
	height 			    :   Number,
	user_agent 			:   String,
	history_length 		:   Number,
	client_ip			:   String
	
});

//logSchema.plugin(require('mongoose-lifecycle'));
logSchema.plugin(require('mongoose-eventify'));

var LogModel = mongoose.model('Log', logSchema);

module.exports = LogModel;