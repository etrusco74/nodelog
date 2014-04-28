var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var uuid = require('node-uuid');
var UserModel = require('../models/userModel');

/** user controller **/
UserController = function(){};

/** Create a new user by json data **/
UserController.prototype.save = function(json, ipAddress, callback) {
    var user = new User();
    
    if (!(typeof json.first_name === 'undefined') )     {
        user.first_name = json.first_name;
    }
    if (!(typeof json.last_name === 'undefined') )      {
        user.last_name = json.last_name;
    }
    if (!(typeof json.username === 'undefined') )       {
        user.username = json.username;
    }
    if (!(typeof json.password === 'undefined') )       {
        user.password = bcrypt.hashSync(json.password, salt);
    }
    if (!(typeof json.email === 'undefined') )          {
        user.email = json.email;
    }    
    
    user.auth.authkey = uuid.v1();
    user.auth.ipaddress = ipAddress;

    user.save(function (err, user) {
        if (err) callback(err.message, null)
        else {
            User.findOne({username: user.username}, {password:0}, function (err2, userRes) {
                if (err2)    callback(err2.message, null)
                else {
                    if (userRes != null)    callback(null, userRes);
                    else                    callback('User not found', null);
                }
            });
        }
    });
};


/** exports **/
exports.UserController = UserController;