var mongoose = require('mongoose');
var moment = require('moment'); 

/** Log Model **/
var logSchema = mongoose.Schema({
    
    client_id 			:  	{ type: String, required: true},
    log_date            :  	{ type: Date, required: true, default: moment()},
    day                 :  	{ type: String, required: true},
	location: {
	    href            :   String,
        protocol        :   String,
        host            :   String,
        search          :   String,
        queryParams     :   mongoose.Schema.Types.Mixed,
        pathname        :   String,
        page            :   String
    },
	referrer: {
	    href            :   String,
        protocol        :   String,
        host            :   String,
        search          :   String,
        queryParams     :   mongoose.Schema.Types.Mixed,
        pathname        :   String,
        page            :   String
    },
	width 				:   Number,
	height 			    :   Number,
	user_agent 			:   String,
	agent               :   String,
	operating_system    :   String,
	device              :   String,
	history_length 		:   Number,
	client_ip			:   String,
	geo_ip              :   mongoose.Schema.Types.Mixed
	
});

logSchema.plugin(require('mongoose-eventify'));

var LogModel = mongoose.model('Log', logSchema);

module.exports = LogModel;