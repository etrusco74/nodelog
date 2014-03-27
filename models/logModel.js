var mongoose = require('mongoose');
var moment = require('moment'); 

/** Log Model **/
var logSchema = mongoose.Schema({
    
    client_id 			:  	{ type: String, required: true},
    log_date            :  	{ type: Date, required: true, default: moment()},
    day                 :  	{ type: String, required: true},
	location: {
	    href            : String,
        protocol        : String,
        host            : String,
        search          : String,
        queryParams     : mongoose.Schema.Types.Mixed,
        pathname        : String,
        page            : String
    },
	referrer: {
	    href            : String,
        protocol        : String,
        host            : String,
        search          : String,
        queryParams     : mongoose.Schema.Types.Mixed,
        pathname        : String,
        page            : String
    },
	width 				:   Number,
	height 			    :   Number,
	user_agent 			:   String,
	history_length 		:   Number,
	client_ip			:   String
	
});

logSchema.plugin(require('mongoose-eventify'));

var LogModel = mongoose.model('Log', logSchema);

module.exports = LogModel;