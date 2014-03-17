var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

var _ = require('underscore');
var mongoose = require('mongoose');
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
app.get('/nodelog', api.setNodelog);
app.get('/ip', api.getUniqueIpAddress);


/** get 404 error **/
app.all('*', function(req, res){
  res.send('mmmmhhh!!! ... ', 404);
});

server.listen(app.get('port'), function () {
    console.log("Express server started and listening on port " + app.get('port'));
});

/** socket.io **/
var messages = [];
var sockets = [];
var LogModel = require('./models/logModel');

io.configure(function (){
  io.set('log level', 1);
  io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'jsonp-polling']);
});

io.on('connection', function (socket) {
    
    /*
    messages.forEach(function (data) {
        socket.emit('message', data);
    });
    */
    
    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    LogModel.on('add', function(logRes) {
    
        var text = logRes;

        if (!text)
        return;
        
        socket.get('name', function (err, name) {
            
            if(name == text.client_id) {
        
                var data = {
                  sid: socket.id,
                  name: name,
                  text: text
                };
                
                console.log ('>>> EVENT FIRED ' + _.indexOf(messages, data) + ' - data : ' + JSON.stringify(data) + ' - messages : ' + JSON.stringify(_.object(messages))) ;
                if(_.indexOf(messages, data) == -1) {
                    messages.push(data);
                    broadcast('message', data);
                }
                
            }
            
        });
    });
    
    socket.on('identify', function (name) {
      socket.set('name', name, function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    //socket.emit(event, data);
    io.sockets.socket(data.sid).emit(event, data);
  });
}



/*
io.configure(function (){
  io.set('log level', 1);
  io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'jsonp-polling']);
});

io.sockets.on('connection', function(socket) {
    console.log('Started socket connection');
    socket.on('room', function(room) {
        socket.join(room);
        console.log('Joined room: ' + room);
        socket.emit('message', 'Joined room: ' + room);
    });
    
});

var LogModel = require('./models/logModel');
LogModel.on('afterInsert', function(logRes) {
    console.log('EVENT FIRED - ' + JSON.stringify(logRes));
    io.sockets.in(logRes.client_id).emit('message', JSON.stringify(logRes));
    console.log('Send data to room: ' + logRes.client_id);
});
*/