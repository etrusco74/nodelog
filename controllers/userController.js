var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var uuid = require('node-uuid');
var moment  = require('moment'); 
var UserModel = require('../models/userModel');

/** Provider **/

/** user controller **/
UserController = function(){};

/** Find user by ID **/
UserController.prototype.findById = function(id, callback) {
    UserModel.findById(id, {password:0}, function (err, user) {
        if (err)    callback(err.message, null)
         else {
            if (user != null)   callback( null, user.toObject() );
            else                callback( 'User not found', null);
        }
    });
};

/** Find user by username **/
UserController.prototype.findByUsername = function(username, callback) {
    UserModel.findOne({'username': username}, {password:0}, function (err, user) {
        if (err)    callback(err.message, null)
         else {
            if (user != null)   callback( null, user.toObject() );
            else                callback( 'User not found', null);
        }
    });
};

/** Login with username and password **/
UserController.prototype.login = function(json, ipAddress, callback) {
    UserModel.findOne({ $and: [ {'verified':true}, {'username':json.username} ] }, function (err, user) {
        
        if (err)    callback(err.message, null)
        else {
            if (user != null) {
                if (bcrypt.compareSync(json.password, user.password)) {

                    user.auth.authkey = uuid.v1();
                    user.auth.ipaddress = ipAddress;
                    user.auth.login_date = moment().utc();

                    user.save(function (err2, user) {
                        if (err2)   callback(err2.message, null);
                        else {
                            UserModel.findOne({username: user.username}, {password:0}, function (err3, userNoPwd) {
                                if (err3)   callback(err3.message, null)
                                else        callback(null, userNoPwd);
                            });
                        }
                    });

                }
                else    callback('Wrong Password', null);
            }
            else    callback('User inactive or not found', null);
        }
    });
};

/** Create a new user by json data **/
UserController.prototype.save = function(json, ipAddress, callback) {
    var user = new UserModel();
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
    
    user.registration_date = moment().utc();
    user.auth.authkey = uuid.v1();
    user.auth.ipaddress = ipAddress;
    
    user.save(function (err, user) {
        if (err) callback(err.message, null)
        else {
            UserModel.findOne({username: user.username}, {password:0}, function (err2, userRes) {
                if (err2)    callback(err2.message, null)
                else {
                    if (userRes != null)    callback(null, userRes);
                    else                    callback('User not found', null);
                }
            });
        }
    });
};

/** Update user by json data **/
UserController.prototype.updateById = function(id, json, callback) {
    UserModel.findById(id, function (err, user) {
        if (err) callback(err.message, null)
        else {
            if (user != null) {

                if (!(typeof json.first_name === 'undefined') )     {
                    user.first_name = json.first_name;
                }
                if (!(typeof json.last_name === 'undefined') )      {
                    user.last_name = json.last_name;
                }
                if (!(typeof json.password === 'undefined') )       {
                    user.password = bcrypt.hashSync(json.password, salt);
                }
                if (!(typeof json.email === 'undefined') )          {
                    user.email = json.email;
                }    
                
                user.save(function (err2, user) {
                    if (err2) callback(err2.message, null)
                    else {
                        UserModel.findOne({username: user.username}, {password:0}, function (err3, userRes) {
                            if (err3)    callback(err3.message, null)
                            else {
                                if (userRes != null)    callback(null, userRes);
                                else                    callback('User not found', null);
                            }
                        });
                    }
                });
            }
            else callback(null, null);
            }
    });
};

/** Delete All users **/
UserController.prototype.deleteAll = function(callback) {
    UserModel.remove(function (err) {
        if (err) callback(err.message)
        else callback(null);
    });
};

/** Delete user by id **/
UserController.prototype.deleteById = function(id, callback) {
    UserModel.findById(id, {password:0}, function (err, user) {
        if (err) callback(err.message, null)
        else {
            if (user != null) {
                user.remove(function (err2) {
                        if (err2) callback(err2.message)
                        else callback(null);
                    });
            }
            else callback(null);
            }
    });
};

/** Check authKey by username **/
UserController.prototype.checkAuthKey = function(json, callback) {
    UserModel.findOne( {$and: [ {'auth.authkey': json.authKey}, {'username':json.username} ] } , {password:0}, function (err, user) {
        if (err)    callback(err.message, null)
         else {
            if (user != null)   {
                var today = moment().utc();
                var diff = today.diff(user.auth.login_date, 'hour');
                if (diff > 24)
                    callback( 'Last login '+diff+' hours ago - session expired - relogin required' , null);
                else
                    callback( null, user.toObject() );
            }
            else    callback( 'Invalid Token', null);
        }
    });
};

/** Activate user by id **/
UserController.prototype.activate = function(json, callback) {
    UserModel.findOne( {$and: [ {'auth.authkey': json.params.key}, {'_id':json.params.id} ] } , {password:0}, function (err, user) {
        if (err) callback(err.message, null)
        else {
            if (user != null) {                
                
                user.verified = true;
                user.auth.authkey = uuid.v1();
                user.auth.ipaddress = json.ipAddress;
                user.auth.activate_date = moment().utc();
                
                user.save(function (err2, user) {
                        if (err2)   callback(err2.message, null)
                        else        callback(null, user);
                });
            }
            else callback('user or apikey not found', null);
        }
    });
};

/** Reset password user by email **/
UserController.prototype.resetPassword = function(json, callback) {
    UserModel.findOne({email: json.params.email}, function (err, user) {
        if (err) callback(err.message, null, null)
        else {
            if (user != null) {                
                
                var pwd = uuid.v1().substring(0,8);
                user.password = bcrypt.hashSync(pwd, salt);
                
                user.save(function (err2, user) {
                        if (err2)   callback(err2.message, null, null)
                        else        callback(null, user, pwd);
                });
            }
            else callback('email not found', null, null);
        }
    });
};



/** exports **/
exports.UserController = UserController;