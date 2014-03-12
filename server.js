var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

//var http = require('http');
//var io = require('socket.io');
var mongoose = require('mongoose');
var path = require('path');


var config = require('./config/config');
mongoose.connect('mongodb://' + config.mongo.user + ':' + config.mongo.password + '@' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.db);
var api = require('./api/api');

/** app config **/
app.configure(function () {
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.compress()),
    app.use(express.methodOverride()),
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, '/public')));
    app.engine('.html', require('ejs').__express);
    app.set('port', config.web.port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

console.log(app.get('env'));

/** cross domain request **/
app.all('*', function(req, res, next){
  if (!req.get('Origin')) return next();
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Cache-Control, authkey, username, lang, dir');
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});

/** app route view **/ 
app.get('/nodelog', api.getNodelog);

/** get 404 error **/
app.all('*', function(req, res){
  res.send('mmmmhhh!!! ... ', 404);
});

//http.createServer(app).listen(app.get('port'), function () {
server.listen(app.get('port'), function () {
    console.log("Express server started and listening on port " + app.get('port'));
});

io.sockets.on('connection', function (socket) {
    var LogModel = require('./models/logModel');
    LogModel.on('afterInsert', function(logRes) {
        socket.emit('news', JSON.stringify(logRes));
        console.log('EVENT FIRED - New log created - ' + JSON.stringify(logRes));
    });
});