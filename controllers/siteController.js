var uuid = require('node-uuid');
var moment  = require('moment'); 
var SiteModel = require('../models/siteModel');

/** site controller **/
SiteController = function(){};

/** Find site by ID **/
SiteController.prototype.findById = function(id, callback) {
    SiteModel.findById(id, function (err, site) {
        if (err)    callback(err.message, null)
         else {
            if (site != null)   callback( null, site.toObject() );
            else                callback( 'Site not found', null);
        }
    });
};

/** Find sites by username **/
SiteController.prototype.findByUsername = function(username, callback) {
    SiteModel.find({'username': username}, function (err, sites) {
        if (err)    callback(err.message, null)
         else {
            if (sites != null)      callback( null, sites );
            else                    callback( 'Sites not found', null);
        }
    });
};

/** Create a new site by json data **/
SiteController.prototype.save = function(json, callback) {
    var site = new SiteModel();

    if (!(typeof json.username === 'undefined') )     {
        site.username = json.username;
    }
    if (!(typeof json.website === 'undefined') )     {
        site.website = json.website;
    }
    if (!(typeof json.tag === 'undefined') )     {
        site.tag = json.tag;
    }
    site.creation_date = moment().utc();
    site.client_id = uuid.v1();
    
    site.save(function (err, site) {
        if (err) callback(err.message, null)
        else {
            SiteModel.findOne({client_id: site.client_id}, function (err2, siteRes) {
                if (err2)    callback(err2.message, null)
                else {
                    if (siteRes != null)    callback(null, siteRes);
                    else                    callback('Site not found', null);
                }
            });
        }
    });
};

/** Update site by json data **/
SiteController.prototype.updateById = function(id, json, callback) {
    SiteModel.findById(id, function (err, site) {
        if (err) callback(err.message, null)
        else {
            if (site != null) {

                if (!(typeof json.website === 'undefined') )     {
                    site.website = json.website;
                }
                if (!(typeof json.tag === 'undefined') )     {
                    site.tag = json.tag;
                }
                
                site.save(function (err2, site) {
                    if (err2) callback(err2.message, null)
                    else {
                        SiteModel.findOne({client_id: site.client_id}, function (err2, siteRes) {
                            if (err2)    callback(err2.message, null)
                            else {
                                if (siteRes != null)    callback(null, siteRes);
                                else                    callback('Site not found', null);
                            }
                        });
                    }
                });
            }
            else callback(null, null);
            }
    });
};

/** Delete site by id **/
SiteController.prototype.deleteById = function(id, callback) {
    SiteModel.findById(id, function (err, site) {
        if (err) callback(err.message, null)
        else {
            if (site != null) {
                site.remove(function (err2) {
                        if (err2) callback(err2.message)
                        else callback(null);
                    });
            }
            else callback(null);
            }
    });
};

/** Check username by client_id **/
SiteController.prototype.checkUsername = function(json, callback) {
    SiteModel.findOne( {$and: [ {'client_id': json.params.client_id}, {'username':json.username} ] } , function (err, site) {
        if (err)    callback(err.message, null)
         else {
            if (site != null)   {
                    callback( null, site);
            }
            else    callback( 'Invalid Username', null);
        }
    });
};

/** exports **/
exports.SiteController = SiteController;