var mongoose = require('mongoose');

/** IP Model **/
var statSchema = mongoose.Schema({
    
    client_id 			:  	{ type: String, required: true},
    day                 :  	{ type: String, required: true},
	uniqueAccess       	:   Number,
	pageView 			:   Number
});

statSchema.plugin(require('mongoose-eventify'));

var StatModel = mongoose.model('Stat', statSchema);

module.exports = StatModel;