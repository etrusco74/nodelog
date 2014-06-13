var fs      = require('fs');
var path    = require('path');
var url     = require('url');
var queryString = require('querystring');
var useragent = require('useragent');
var moment  = require('moment'); 
var rest = require('restler');

var imgPath = path.join(__dirname, '../public/css/img/');
var logPath = path.join(__dirname, '../log/');
var utils   = require('../config/utils');

var UserController = require('../controllers/userController').UserController;
var SiteController = require('../controllers/siteController').SiteController;
var LogController = require('../controllers/logController').LogController;
var StatController = require('../controllers/statController').StatController;
var MailController = require('../controllers/mailController').MailController;

var userController = new UserController();
var siteController = new SiteController();
var logController = new LogController();
var statController = new StatController();
var mailController = new MailController();

/*************************************** USER API ***************************************/

/********** GET method **********/

/** findUserById - private **/
var findUserById = function(req, res) {

    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    var authObj = { };

    console.log('------------------- GET - api findUserById - private --------------------- ');

    authObj.authKey = req.headers.authkey;
    authObj.username = req.headers.username;
    authObj.lang = req.headers.lang;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'findUserById';
    authObj.verb = 'GET';
    authObj.params = req.params;
   
    if ((typeof req.headers.authkey === 'undefined') || (typeof req.headers.username === 'undefined'))  {
        jsonObj.success = false;
        jsonObj.error = 'auth token required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
    }
    else    {
        userController.checkAuthKey(authObj, function(err, user){
            if (err) {
                authObj.isAuth = false;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                jsonObj.success = false;
                //jsonObj.error = 'AuthKey not found';
                jsonObj.error = err;
                res.send(jsonObj);
                console.log(jsonObj.error);
            }
            else    {
                authObj.isAuth = true;
                console.log('authObj: ' + JSON.stringify(authObj));

                userController.findById(authObj.params.id, function(err, user){
                    if (err) {
                        jsonObj.success = false;
                        jsonObj.error = err;
                        res.send(jsonObj);
                        console.log(jsonObj.error);
                    } else {
                        if (user) {
                            res.send(JSON.stringify(user));
                            console.log('Users: ' + JSON.stringify(user));
                        }
                        else {
                            jsonObj.success = false;
                            jsonObj.error = 'No user found';
                            res.send(jsonObj);
                            console.log(jsonObj.error);
                        }
                    }
                })
            }
        })
    }
};

/** findUserByUsername - private **/
var findUserByUsername = function(req, res) {

    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    var authObj = { };

    console.log('------------------- GET - api findUserByUsername - private --------------------- ');

    authObj.authKey = req.headers.authkey;
    authObj.username = req.headers.username;
    authObj.lang = req.headers.lang;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'findUserByUsername';
    authObj.verb = 'GET';
    authObj.params = req.params;
   
    if ((typeof req.headers.authkey === 'undefined') || (typeof req.headers.username === 'undefined'))  {
        jsonObj.success = false;
        jsonObj.error = 'auth token required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
    }
    else    {
        userController.checkAuthKey(authObj, function(err, user){
            if (err) {
                authObj.isAuth = false;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                jsonObj.success = false;
                jsonObj.error = 'AuthKey not found';
                res.send(jsonObj);
                console.log(jsonObj.error);
            }
            else    {
                authObj.isAuth = true;
                console.log('authObj: ' + JSON.stringify(authObj));

                userController.findByUsername(authObj.params.username, function(err, user){
                    if (err) {
                        authObj.isAuth = true;
                        console.log('authObj: ' + JSON.stringify(authObj));
                        jsonObj.success = false;
                        jsonObj.error = err;
                        res.send(jsonObj);
                        console.log(jsonObj.error);
                    } else {
                        if (user) {
                            res.send(JSON.stringify(user));
                            console.log('Users: ' + JSON.stringify(user));
                        }
                        else {
                            jsonObj.success = false;
                            jsonObj.error = 'No user found';
                            res.send(jsonObj);
                            console.log(jsonObj.error);
                        }
                    }
                })
            }
        })
    }
};

/********** POST method **********/

/** login - public **/
var login = function(req, res) {

    res.set('Content-Type', 'application/json');
        
    var jsonObj = { };
    var authObj = { };
    var userReq = req.body;
    
    console.log(JSON.stringify(req.body));
    
    console.log('------------------- POST - api login - public  --------------------- ');
    
    authObj.lang = req.headers.lang;
    
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'login';
    authObj.verb = 'POST';
    console.log('request body: ' + JSON.stringify(userReq));
    console.log('authObj: ' + JSON.stringify(authObj));
    
    var content_type = req.get('content-type');    
    if (content_type.indexOf("application/json") === -1)   {
        jsonObj.success = false;
        jsonObj.error = 'Content Type must be application/json';
        res.send(jsonObj);
        console.log(jsonObj.error);
        return;
    }
    if (typeof userReq.username === 'undefined')       {
        jsonObj.success = false;
        jsonObj.error = 'username required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        return;
    }
    if (typeof userReq.password === 'undefined')       {
        jsonObj.success = false;
        jsonObj.error = 'password required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        return;
    }
    userController.login(userReq, authObj.ipAddress, function(err, userRes){
        if (err) {
            jsonObj.success = false;
            jsonObj.error = err;
            res.send(jsonObj);
            console.log(jsonObj.error);
        } else {
            if (userRes != null) {
                jsonObj.success = true;
                jsonObj.user    = userRes;
                res.send(jsonObj);
                console.log('Login ok');
                console.log('User: ' + JSON.stringify(userRes));
            }
            else {
                jsonObj.success = false;
                jsonObj.error = "Login Failed";
                res.send(jsonObj);
                console.log('Login Failed');
            }
        }
    })
};

/** saveUser - public **/
var saveUser = function(req, res) {

    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    var authObj = { };
    var userReq = req.body;

    console.log('------------------- POST - api saveUser -public --------------------- ');

    authObj.lang = req.headers.lang;
    
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'saveUser';
    authObj.verb = 'POST';
    console.log('request body: ' + JSON.stringify(userReq));
    console.log('authObj: ' + JSON.stringify(authObj));

    var content_type = req.get('content-type');    
    if (content_type.indexOf("application/json") === -1)   {
        jsonObj.success = false;
        jsonObj.error = 'Content Type must be application/json';
        res.send(jsonObj);
        console.log(jsonObj.error);
        return;
    }
    userController.save(userReq, authObj.ipAddress, function(err, userRes){
        if (err) {
            jsonObj.success = false;
            jsonObj.error = err;
            res.send(jsonObj);
            console.log(jsonObj.error);
        } else {
            jsonObj.success = true;
            jsonObj.user    = userRes;
            res.send(jsonObj);
            console.log('Registration ok');
            console.log('User: ' + JSON.stringify(userRes));
                         
            /** send activate mail **/            
            mailController.activate(userRes, authObj.lang, function(err, res){
                console.log('err ' + JSON.stringify(err));
                console.log('res ' + JSON.stringify(res));
            });
        }
    })
};

/********** PUT method **********/

/** updateUserById - private **/
var updateUserById = function(req, res) {

    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    var authObj = { };
    var userReq = req.body;

    console.log('------------------- PUT - api updateUserById - private --------------------- ');

    authObj.authKey = req.headers.authkey;
    authObj.username = req.headers.username;
    authObj.lang = req.headers.lang;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'updateUserById';
    authObj.verb = 'PUT';
    authObj.params = req.params;
    console.log('request body: ' + JSON.stringify(userReq));
    
    var content_type = req.get('content-type');    
    if (content_type.indexOf("application/json") === -1)   {
        jsonObj.success = false;
        jsonObj.error = 'Content Type must be application/json';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
        return;
    }

    if ((typeof req.headers.authkey === 'undefined') || (typeof req.headers.username === 'undefined'))  {
        jsonObj.success = false;
        jsonObj.error = 'auth token required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
    }
    else    {
        userController.checkAuthKey(authObj, function(err, user){
            if (err) {
                authObj.isAuth = false;
                console.log('authObj: ' + JSON.stringify(authObj));

                jsonObj.success = false;
                jsonObj.error = 'AuthKey not found';
                res.send(jsonObj);
                console.log(jsonObj.error);
            }
            else    {
                authObj.isAuth = true;
                console.log('authObj: ' + JSON.stringify(authObj));

                userController.updateById(authObj.params.id, userReq, function(err, userRes){
                    if (err) {
                        jsonObj.success = false;
                        jsonObj.error = err;
                        res.send(jsonObj);
                        console.log(jsonObj.error);
                    } else {
                        if (userRes) {
                            jsonObj.success = true;
                            jsonObj.user = userRes;
                            res.send(jsonObj);
                            console.log('User updated');
                            console.log('User: ' + JSON.stringify(userRes));
                        }
                        else {
                            jsonObj.success = false;
                            jsonObj.error = 'No user found';
                            res.send(jsonObj);
                            console.log(jsonObj.error);
                        }
                    }
                })
            }
        })
    }
};

/** activateUserById - public **/
var activateUserById = function(req, res) {

    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    var authObj = { };

    console.log('------------------- PUT - api activateUserById - public --------------------- ');

    authObj.lang = req.headers.lang;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'activateUserById';
    authObj.verb = 'PUT';
    authObj.params = req.params;
    
    userController.activate(authObj, function(err, userRes){
        if (err) {
            jsonObj.success = false;
            jsonObj.error = err;
            res.send(jsonObj);
            console.log(jsonObj.error);
        } else {
            jsonObj.success = true;
            jsonObj.desc = 'User activated';
            res.send(jsonObj);
            console.log('User activated');
            
            /** send welcome mail **/  
            mailController.welcome(userRes, authObj.lang, function(err, res){
                console.log(err);
                console.log(res);
            });
        }
    })  
    
};

/** resetUserPassword - public **/
var resetUserPassword = function(req, res) {

    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    var authObj = { };

    console.log('------------------- PUT - api resetUserPassword - public --------------------- ');

    authObj.lang = req.headers.lang;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'resetUserPassword';
    authObj.verb = 'PUT';
    authObj.params = req.params;
    
    userController.resetPassword(authObj, function(err, userRes, pwd){
        if (err) {
            jsonObj.success = false;
            jsonObj.error = err;
            res.send(jsonObj);
            console.log(jsonObj.error);
        } else {
            jsonObj.success = true;
            jsonObj.desc = 'Password reset';
            res.send(jsonObj);
            console.log('Password reset');
            
            /** send resend password mail **/ 
            mailController.resend(userRes, authObj.lang, pwd, function(err, res){
                console.log(err);
                console.log(res);
            });
        }
    })
   
    
};

/********** DELETE method **********/

/** deleteUserById - private **/
var deleteUserById = function(req, res) {

    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    var authObj = { };

    console.log('------------------- DELETE - api deleteUserById - private --------------------- ');

    authObj.authKey = req.headers.authkey;
    authObj.username = req.headers.username;
    authObj.lang = req.headers.lang;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'deleteUserById';
    authObj.verb = 'DELETE';
    authObj.params = req.params;
    
    if ((typeof req.headers.authkey === 'undefined') || (typeof req.headers.username === 'undefined'))  {
        jsonObj.success = false;
        jsonObj.error = 'auth token required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
    }
    else {
        userController.checkAuthKey(authObj, function(err, user){
            if (err) {
                authObj.isAuth = false;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                jsonObj.success = false;
                jsonObj.error = 'AuthKey not found';
                res.send(jsonObj);
                console.log(jsonObj.error);
            }
            else    {
                authObj.isAuth = true;
                console.log('authObj: ' + JSON.stringify(authObj));

                userController.deleteById(authObj.params.id, function(err){
                    if (err) {
                        jsonObj.success = false;
                        jsonObj.error = err;
                        res.send(jsonObj);
                        console.log(jsonObj.error);
                    } else {
                        jsonObj.success = true;
                        jsonObj.desc = 'User deleted';
                        res.send(jsonObj);
                        console.log('User deleted');
                    }
                })
            }
        })
    }
};


/*************************************** SITE API ***************************************/

/********** GET method **********/

/** findSiteById - private **/
var findSiteById = function(req, res) {

    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    var authObj = { };
    
    console.log('------------------- GET - api findSiteById - private --------------------- ');

    authObj.authKey = req.headers.authkey;
    authObj.username = req.headers.username;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'findSiteById';
    authObj.verb = 'GET';    
    authObj.params = req.params;
    
    /*
    var content_type = req.get('content-type');    
    if (content_type.indexOf("application/json") === -1)   {
        jsonObj.success = false;
        jsonObj.error = 'Content Type must be application/json';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
        return;
    }
    */
    
    if ((typeof req.headers.authkey === 'undefined') || (typeof req.headers.username === 'undefined'))  {
        jsonObj.success = false;
        jsonObj.error = 'auth token required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
    }
    else    {
        userController.checkAuthKey(authObj, function(err, user){
            if (err) {
                authObj.isAuth = false;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                jsonObj.success = false;
                jsonObj.error = 'AuthKey not found';
                res.send(jsonObj);
                console.log(jsonObj.error);
            }
            else    {
                authObj.isAuth = true;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                siteController.findById(authObj.params.id, function(err, site){
                    if (err) {
                        jsonObj.success = false;
                        jsonObj.error = err;
                        res.send(jsonObj);
                        console.log(jsonObj.error);
                    } else {
                        if (site) {
                            res.send(JSON.stringify(site));
                            console.log('Site: ' + JSON.stringify(site));
                        }
                        else {
                            jsonObj.success = false;
                            jsonObj.error = 'No site found';
                            res.send(jsonObj);
                            console.log(jsonObj.error);
                        }
                    }
                })
            
            }
        })
    }            
};

/** findSitesByUsername - private **/
var findSitesByUsername = function(req, res) {

    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    var authObj = { };
    
    console.log('------------------- GET - api findSitesByUsername - private --------------------- ');

    authObj.authKey = req.headers.authkey;
    authObj.username = req.headers.username;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'findSitesByUsername';
    authObj.verb = 'GET';    
    authObj.params = req.params;
    
    /*
    var content_type = req.get('content-type');    
    if (content_type.indexOf("application/json") === -1)   {
        jsonObj.success = false;
        jsonObj.error = 'Content Type must be application/json';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
        return;
    }
    */
    
    if ((typeof req.headers.authkey === 'undefined') || (typeof req.headers.username === 'undefined'))  {
        jsonObj.success = false;
        jsonObj.error = 'auth token required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
    }
    else    {
        userController.checkAuthKey(authObj, function(err, user){
            if (err) {
                authObj.isAuth = false;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                jsonObj.success = false;
                jsonObj.error = 'AuthKey not found';
                res.send(jsonObj);
                console.log(jsonObj.error);
            }
            else    {
                authObj.isAuth = true;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                siteController.findByUsername(authObj.params.username, function(err, sites){
                    if (err) {
                        jsonObj.success = false;
                        jsonObj.error = err;
                        res.send(jsonObj);
                        console.log(jsonObj.error);
                    } else {
                        if (sites) {
                            res.send(JSON.stringify(sites));
                            console.log('Sites: ' + JSON.stringify(sites));
                        }
                        else {
                            jsonObj.success = false;
                            jsonObj.error = 'No sites found';
                            res.send(jsonObj);
                            console.log(jsonObj.error);
                        }
                    }
                })
            
            }
        })
    }            
};

/********** POST method **********/

/** saveSite - private **/
var saveSite = function(req, res) {

    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    var authObj = { };
    var siteReq = req.body;

    console.log('------------------- POST - api saveSite - private --------------------- ');

    authObj.authKey = req.headers.authkey;
    authObj.username = req.headers.username;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'saveSite';
    authObj.verb = 'POST';    
    console.log('request body: ' + JSON.stringify(siteReq));    
    
    /*
    var content_type = req.get('content-type');    
    if (content_type.indexOf("application/json") === -1)   {
        jsonObj.success = false;
        jsonObj.error = 'Content Type must be application/json';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
        return;
    }
    */
    
    if ((typeof req.headers.authkey === 'undefined') || (typeof req.headers.username === 'undefined'))  {
        jsonObj.success = false;
        jsonObj.error = 'auth token required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
    }
    else    {
        userController.checkAuthKey(authObj, function(err, user){
            if (err) {
                authObj.isAuth = false;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                jsonObj.success = false;
                jsonObj.error = 'AuthKey not found';
                res.send(jsonObj);
                console.log(jsonObj.error);
            }
            else    {
                authObj.isAuth = true;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                siteReq.username = authObj.username;
                siteController.save(siteReq, function(err, siteRes){
                    if (err) {
                        jsonObj.success = false;
                        jsonObj.error = err;
                        res.send(jsonObj);
                        console.log(jsonObj.error);
                    } else {
                        jsonObj.success = true;
                        jsonObj.site    = siteRes;
                        res.send(jsonObj);
                        console.log('Site Saved');
                        console.log('Site: ' + JSON.stringify(siteRes));
                    }
                })
            
            }
        })
    }            
};

/********** PUT method **********/

/** updateSiteById - private **/
var updateSiteById = function(req, res) {

    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    var authObj = { };
    var siteReq = req.body;

    console.log('------------------- PUT - api updateSiteById - private --------------------- ');

    authObj.authKey = req.headers.authkey;
    authObj.username = req.headers.username;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'updateSiteById';
    authObj.verb = 'PUT';    
    authObj.params = req.params;
    console.log('request body: ' + JSON.stringify(siteReq));    
    
    /*
    var content_type = req.get('content-type');    
    if (content_type.indexOf("application/json") === -1)   {
        jsonObj.success = false;
        jsonObj.error = 'Content Type must be application/json';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
        return;
    }
    */
    
    if ((typeof req.headers.authkey === 'undefined') || (typeof req.headers.username === 'undefined'))  {
        jsonObj.success = false;
        jsonObj.error = 'auth token required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
    }
    else    {
        userController.checkAuthKey(authObj, function(err, user){
            if (err) {
                authObj.isAuth = false;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                jsonObj.success = false;
                jsonObj.error = 'AuthKey not found';
                res.send(jsonObj);
                console.log(jsonObj.error);
            }
            else    {
                authObj.isAuth = true;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                siteReq.username = authObj.username;
                siteController.updateById(authObj.params.id, siteReq, function(err, siteRes){
                    if (err) {
                        jsonObj.success = false;
                        jsonObj.error = err;
                        res.send(jsonObj);
                        console.log(jsonObj.error);
                    } else {
                        jsonObj.success = true;
                        jsonObj.site    = siteRes;
                        res.send(jsonObj);
                        console.log('Site Saved');
                        console.log('Site: ' + JSON.stringify(siteRes));
                    }
                })
            
            }
        })
    }            
};

/********** DELETE method **********/

/** deleteSiteById - private **/
var deleteSiteById = function(req, res) {

    res.set('Content-Type', 'application/json');

    var jsonObj = { };
    var authObj = { };
    
    console.log('------------------- DELETE - api deleteSiteById - private --------------------- ');

    authObj.authKey = req.headers.authkey;
    authObj.username = req.headers.username;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'deleteSiteById';
    authObj.verb = 'DELETE';    
    authObj.params = req.params;
    
    /*
    var content_type = req.get('content-type');    
    if (content_type.indexOf("application/json") === -1)   {
        jsonObj.success = false;
        jsonObj.error = 'Content Type must be application/json';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
        return;
    }
    */
    
    if ((typeof req.headers.authkey === 'undefined') || (typeof req.headers.username === 'undefined'))  {
        jsonObj.success = false;
        jsonObj.error = 'auth token required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
    }
    else    {
        userController.checkAuthKey(authObj, function(err, user){
            if (err) {
                authObj.isAuth = false;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                jsonObj.success = false;
                jsonObj.error = 'AuthKey not found';
                res.send(jsonObj);
                console.log(jsonObj.error);
            }
            else    {
                authObj.isAuth = true;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                siteController.deleteById(authObj.params.id, function(err, siteRes){
                    if (err) {
                        jsonObj.success = false;
                        jsonObj.error = err;
                        res.send(jsonObj);
                        console.log(jsonObj.error);
                    } else {
                        jsonObj.success = true;
                        jsonObj.desc = 'Site deleted';
                        res.send(jsonObj);
                        console.log('Site deleted');
                    }
                })
            
            }
        })
    }            
};

/*************************************** LOG API ****************************************/
/** set nodelog  - public **/
var setNodelog = function(req, res) {
    
    res.set('Content-Type', 'application/json');

    var jsonObjLog = {};
    var location = {};
    var referrer = {};
    var jsonObjStat = {};
    var queryParams = {};

    console.log('------------------- GET - api setNodelog - public --------------------- ');
    
    jsonObjLog.client_id = req.query.u;
    jsonObjLog.log_date = moment().utc();
    jsonObjLog.day = moment().utc().format("YYYYMMDD");
    
    var locationUrl         = url.parse(req.query.l, true);
    location.href           = locationUrl.href;
    location.protocol       = locationUrl.protocol;
    location.host           = locationUrl.host;
    location.search         = locationUrl.search;
    location.queryParams    = queryString.parse(location.search.replace(/^.*\?/, ''));  
    location.pathname       = locationUrl.pathname;
    location.page           = utils.getPageUrl(locationUrl);
    jsonObjLog.location     = location;
    
    var referrerUrl         = url.parse(req.query.r, true);
    referrer.href           = referrerUrl.href;
    referrer.protocol       = referrerUrl.protocol;
    referrer.host           = referrerUrl.host;
    referrer.search         = referrerUrl.search;
    referrer.queryParams    = queryString.parse(referrer.search.replace(/^.*\?/, ''));  
    referrer.pathname       = referrerUrl.pathname;
    referrer.page           = utils.getPageUrl(referrerUrl);
    jsonObjLog.referrer     = referrer;
    
    jsonObjLog.width = req.query.w;
    jsonObjLog.height = req.query.h;
    jsonObjLog.user_agent = req.query.a;
    
    var agent = useragent.parse(req.query.a);
    jsonObjLog.agent            = agent.toAgent();                
	jsonObjLog.operating_system = agent.os.toString();        
	jsonObjLog.device           = agent.device.toString();             
	
    jsonObjLog.history_length = req.query.hl;
    jsonObjLog.client_ip = utils.getClientIp(req);
    
    var rest_url = 'http://freegeoip.net/json/' + jsonObjLog.client_ip;
    rest.get(rest_url).on('complete', function(data) {
        console.log('GEO IP ' + JSON.stringify(data)); // auto convert to object
        jsonObjLog.geo_ip = data;

        logController.save(jsonObjLog, function(err, logRes){
            if (err) console.log(err);
            
            /** check for unique IP address **/
            logController.bestPageInDay(logRes, function(err, bestPages){
                console.log('>>> best page : ' + JSON.stringify(bestPages));
            
                logController.existIpAddressInDay(logRes, function(err, logRes2){
                    
                        jsonObjStat.client_id = jsonObjLog.client_id;
                        jsonObjStat.stat_date = moment().utc().format('YYYY-MM-DD[T00:00:00.000]');
                        jsonObjStat.day = jsonObjLog.day;
                        jsonObjStat.bestPages = bestPages;
                            
                        if (logRes2.length == 1) {
                            console.log('INCREMENT - first access for IP ' + jsonObjLog.client_ip + ' in day ' + jsonObjLog.day + ' for client_id ' + jsonObjLog.client_id);
                            jsonObjStat.first_access = true;
                            statController.save(jsonObjStat, function(err, statRes){
                                if (err) console.log(err);
                                console.log(statRes);
                            });    
                        }
                        else    {
                            console.log('NOT INCREMENT - ip ' + jsonObjLog.client_ip + ' already exist in day ' + jsonObjLog.day + ' for client_id ' + jsonObjLog.client_id);
                            jsonObjStat.first_access = false;
                            statController.save(jsonObjStat, function(err, statRes){
                                if (err) console.log(err);
                                console.log(statRes);
                            });  
                        }
                    
                    });  
                });     
        });
        
        res.set('Content-Type', 'image/gif');
        res.sendfile(imgPath + '1.gif');
    
    });
};

/*************************************** STAT API ***************************************/
/** get daily unique access - private **/
var getDailyUniqueAccess = function(req, res) {
    
    res.set('Content-Type', 'application/json');
    
    var jsonObj = { };
    var authObj = { };
    
    console.log('------------------- GET - api getDailyUniqueAccess - private --------------------- ');
    
    authObj.authKey = req.headers.authkey;
    authObj.username = req.headers.username;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'getDailyUniqueAccess';
    authObj.verb = 'GET';
    authObj.params = req.params;
    
    if ((typeof req.headers.authkey === 'undefined') || (typeof req.headers.username === 'undefined'))  {
        jsonObj.success = false;
        jsonObj.error = 'auth token required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
    }
    else    {
        userController.checkAuthKey(authObj, function(err, user){
            if (err) {
                authObj.isAuth = false;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                jsonObj.success = false;
                jsonObj.error = err;
                res.send(jsonObj);
                console.log(jsonObj.error);
            }
            else    {
                siteController.checkUsername(authObj, function(err, site){
                    if (err) {
                        authObj.isAuth = false;
                        console.log('authObj: ' + JSON.stringify(authObj));
                        
                        jsonObj.success = false;
                        jsonObj.error = err;
                        res.send(jsonObj);
                        console.log(jsonObj.error);
                    }
                    else    {
                        authObj.isAuth = true;
                        console.log('authObj: ' + JSON.stringify(authObj));
            
                        statController.getDailyUniqueAccess(authObj.params, function(err, stat){
                            if (err) {
                                jsonObj.success = false;
                                jsonObj.error = err;
                                res.send(jsonObj);
                                console.log(jsonObj.error);
                            } else {
                                if (stat.length != 0) {
                                    res.send(JSON.stringify(stat));
                                    console.log('Daily unique access: ' + JSON.stringify(stat));
                                }
                                else {
                                    jsonObj.success = false;
                                    jsonObj.error = 'No stat found';
                                    res.send(jsonObj);
                                    console.log(jsonObj.error);
                                }
                            }
                        }) 
                    }
                })                                    
            }
        })
    }    
}

/** get daily page view - private **/
var getDailyPageView = function(req, res) {
    
    res.set('Content-Type', 'application/json');
    
    var jsonObj = { };
    var authObj = { };
    
    console.log('------------------- GET - api getDailyPageView - private --------------------- ');
    
    authObj.authKey = req.headers.authkey;
    authObj.username = req.headers.username;
    
    authObj.isAuth = false;
    authObj.ipAddress = utils.getClientIp(req);
    authObj.api = 'getDailyPageView';
    authObj.verb = 'GET';
    authObj.params = req.params;
    
    if ((typeof req.headers.authkey === 'undefined') || (typeof req.headers.username === 'undefined'))  {
        jsonObj.success = false;
        jsonObj.error = 'auth token required';
        res.send(jsonObj);
        console.log(jsonObj.error);
        console.log('authObj: ' + JSON.stringify(authObj));
    }
    else    {
        userController.checkAuthKey(authObj, function(err, user){
            if (err) {
                authObj.isAuth = false;
                console.log('authObj: ' + JSON.stringify(authObj));
                
                jsonObj.success = false;
                jsonObj.error = err;
                res.send(jsonObj);
                console.log(jsonObj.error);
            }
            else    {
                siteController.checkUsername(authObj, function(err, site){
                    if (err) {
                        authObj.isAuth = false;
                        console.log('authObj: ' + JSON.stringify(authObj));
                        
                        jsonObj.success = false;
                        jsonObj.error = err;
                        res.send(jsonObj);
                        console.log(jsonObj.error);
                    }
                    else    {       
                        authObj.isAuth = true;
                        console.log('authObj: ' + JSON.stringify(authObj));
                        
                        statController.getDailyPageView(req.params, function(err, stat){
                            if (err) {
                                jsonObj.success = false;
                                jsonObj.error = err;
                                res.send(jsonObj);
                                console.log(jsonObj.error);
                            } else {
                                if (stat.length != 0) {
                                    res.send(JSON.stringify(stat));
                                    console.log('Daily page view: ' + JSON.stringify(stat));
                                }
                                else {
                                    jsonObj.success = false;
                                    jsonObj.error = 'No stat found';
                                    res.send(jsonObj);
                                    console.log(jsonObj.error);
                                }
                            }
                        })
                    }
                })     
            }
        })
    }    
}

/****************************************************************************************/

/** exports **/
exports.findUserById = findUserById; 
exports.findUserByUsername = findUserByUsername;
exports.login = login;
exports.saveUser = saveUser;
exports.updateUserById = updateUserById;
exports.activateUserById = activateUserById;
exports.resetUserPassword = resetUserPassword;
exports.deleteUserById = deleteUserById;

exports.findSiteById = findSiteById;
exports.findSitesByUsername = findSitesByUsername;
exports.saveSite = saveSite;
exports.updateSiteById = updateSiteById;
exports.deleteSiteById = deleteSiteById;

exports.setNodelog = setNodelog;
exports.getDailyUniqueAccess = getDailyUniqueAccess;
exports.getDailyPageView = getDailyPageView;