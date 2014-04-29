var path           = require('path');
var templatesDir   = path.join(__dirname, '../templates');
var emailTemplates = require('email-templates');
var config = require('../config/config');
var utils = require("../config/utils");
var postmark = require('postmark')(config.web.postmarkapi);

/** Mail Controller **/
MailController = function(){};

/** Send Welcome Mail **/
MailController.prototype.welcome = function(json, lang, callback) {
    
    json.lang = lang;
    
    emailTemplates(templatesDir, function(err, template) {

        if (err) callback(err, null);
        else {
          
            template(lang + '_welcome', json, function(err, html, text) {
                if (err) callback(err, null);
                else {
                
                    /** set subject **/
                    var subj = '';
                    switch (lang){
                        case "en":
                            subj = 'Welcome to nodelog webapp';
                        break;
                        case "it":
                            subj = 'Benvenuto nella webapp nodelog';
                        break;
                    }
                
                    /** set mail **/
                    var mail = {
                        From: 'Nodelog Team <ademarchi74@pensando.it>',
                        To: json.email,
                        Subject: subj,
                        HtmlBody: html,
                        TextBody: text
                    };
                    console.log(mail);
                
                    /** send mail **/              
                    postmark.send(mail, function(err, response) {
                        if (err)    callback(err, null);
                        else        callback(response, null);                    
                    });
                    }
            });          
            
        }
    });
};

/** Send Activate Mail **/
MailController.prototype.activate = function(json, lang, callback) {
    
    json.lang = lang;
    
    emailTemplates(templatesDir, function(err, template) {

        if (err) callback(err, null);
        else {
          
            template(lang + '_activate', json, function(err, html, text) {
                
                if (err) callback(err, null);
                else {
                
                    /** set subject **/
                    var subj = '';
                    switch (lang){
                        case "en":
                            subj = "Thank you for your registration to nodelog";
                        break;
                        case "it":
                            subj = "Grazie per esserti registrato su nodelog";
                        break;
                    }
                    
                    /** set mail **/
                    var mail = {
                        From: 'Nodelog Team <ademarchi74@pensando.it>',
                        To: json.email,
                        Subject: subj,
                        HtmlBody: html,
                        TextBody: text
                    };
                    console.log(mail);
                
                    /** send mail **/              
                    postmark.send(mail, function(err, response) {
                        if (err)    callback(err, null);
                        else        callback(null, response);                    
                    });
                }
            });          
            
        }
    });
};

/** Resend Mail with new password **/
MailController.prototype.resend = function(json, lang, pwd, callback) {
    
    json.lang = lang;
    json.clean_password = pwd;
    
    emailTemplates(templatesDir, function(err, template) {

        if (err) callback(err, null);
        else {
          
            template(lang + '_resend', json, function(err, html, text) {
                if (err) callback(err, null);
                else {
                
                    /** set subject **/
                    var subj = '';
                    switch (lang){
                        case "en":
                            subj = 'You have requested a password reset for nodelog';
                        break;
                        case "it":
                            subj = 'Hai chiesto un reset password per nodelog';
                        break;
                    }
                
                    /** set mail **/
                    var mail = {
                        From: 'Nodelog Team <ademarchi74@pensando.it>',
                        To: json.email,
                        Subject: subj,
                        HtmlBody: html,
                        TextBody: text
                    };
                    console.log(mail);
                
                    /** send mail **/              
                    postmark.send(mail, function(err, response) {
                        if (err)    callback(err, null);
                        else        callback(response, null);                    
                    });
                    }
            });          
            
        }
    });
};

exports.MailController = MailController;