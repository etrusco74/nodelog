var mongoose = require('mongoose');

/** User Model **/
var userSchema = mongoose.Schema({
    first_name              :   String,
    last_name               :   String,
    username                :   { type: String, required: true, unique: true },
    password                :   { type: String, required: true },
    email                   :   { type: String, unique: true },
    registration_date       :   { type: Date, required: true },
    auth                    :   {
                                    authkey         : String,
                                    ipaddress       : String,
                                    login_date      : Date,
                                    activate_date   : Date
                                },
    verified                :   { type: Boolean, default: false }          
});

var UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;