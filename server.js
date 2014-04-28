var http = require('http');
var path = require('path');
var moment = require('moment'); 
var time = require('time');
var cronJob = require('cron').CronJob;

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

var database = require('./batch/database');
console.log('>>> moment ' + moment().utc().format("YYYYMMDD HH.mm.ss"));
var job = new cronJob('00 00 3 * * *', function(){
    // Runs always at 03:00:00 AM
    console.log('>>> start job ' + moment().utc().format("YYYYMMDD HH.mm.ss"));
    database.cleanDB();
  }, function () {
    // This function is executed when the job stops
    console.log('>>> ebd job ' + moment().utc().format("YYYYMMDD HH.mm.ss"));
  },
  true,
  "UTC"
);

var mongoose = require('mongoose');
var config = require('./config/config');
mongoose.connect('mongodb://' + config.mongo.user + ':' + config.mongo.password + '@' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.db);

var appRoute = require('./routes/app');
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
app.get('/dashboard/:client_id', appRoute.dashboard);
app.get('/stat/:client_id', appRoute.stat);

/** api route - RESTful webservice **/

/** user api **/
app.get('/api/user/id/:id', api.findUserById);
app.get('/api/user/username/:username', api.findUserByUsername);

app.post('/api/login', api.login);
app.post('/api/user', api.saveUser);

app.put('/api/user/id/:id', api.updateUserById);
app.put('/api/user/activate/id/:id/key/:key', api.activateUserById);
app.put('/api/user/resetpwd/email/:email', api.resetUserPassword);

app.delete('/api/user/id/:id', api.deleteUserById);

/** log api **/
app.get('/nodelog', api.setNodelog);

/** stat api **/
app.get('/api/stats/daily/ua/:day/:client_id', api.getDailyUniqueAccess);
app.get('/api/stats/daily/pw/:day/:client_id', api.getDailyPageView);


/** get 404 error **/
app.all('*', function(req, res){
  res.send('mmmmhhh!!! ... ', 404);
});

server.listen(app.get('port'), function () {
    console.log("Express server started and listening on port " + app.get('port'));
});

/** socket.io **/
var sockets = [];
var LogModel = require('./models/logModel');
var StatModel = require('./models/statModel');
var StatController = require('./controllers/statController').StatController;
var statController = new StatController();

io.configure(function (){
  io.set('log level', 1);
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.on('connection', function (socket) {

    sockets.push(socket);
    
    socket.on('identify', function (name) {
        
        socket.set('name', name);
        console.log ('>>> SET SOCKET ID ' + socket.id + ' - NAME ' + name) ;
      
        var jsonObjStat = {};
        jsonObjStat.day = moment().format("YYYYMMDD");
        jsonObjStat.client_id = name;
        
        statController.get(jsonObjStat, function(err, statRes){
            if(statRes!=null) {
                var text = statRes;
                io.sockets.socket(socket.id).emit('num', text);
                console.log ('>>> SENT MESSAGE TO SOCKET ID ' + socket.id + ' - NAME ' + name + ' - client_id ' + statRes.client_id + ' - text ' +  JSON.stringify(text)) ;
            }
        });  
    });
    
    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      console.log ('>>> DISCONNECT SOCKET ID ' + socket.id) ;
    });

    LogModel.on('add', function(logRes) {
        
        var text = logRes;
        console.log ('-------------------------------------------------'); 
        console.log ('>>> LOGMODEL ADD EVENT FIRED'); 
        console.log ('>>> NUMSOCKETS ' + sockets.length); 
        console.log ('>>> client_id ' + text.client_id);
        
        socket.get('name', function (err, name) {
                
            console.log ('>>> GET SOCKET ID ' + socket.id + ' - NAME ' + name);
            
            if(name == text.client_id) {
                
                io.sockets.socket(socket.id).emit('message', text);
                console.log ('>>> SENT MESSAGE TO SOCKET ID ' + socket.id + ' - NAME ' + name + ' - client_id ' + text.client_id + ' - text ' +  JSON.stringify(text)) ;
                
            }
            else    {
                console.log ('>>> MESSAGE NOT SENT');
            }
                
        });
         
    });
    
    StatModel.on('add', function(statRes) {
        
        var text = statRes;
        console.log ('-------------------------------------------------'); 
        console.log ('>>> STATMODEL ADD EVENT FIRED'); 
        console.log ('>>> NUMSOCKETS ' + sockets.length); 
        console.log ('>>> client_id ' + text.client_id);
        
        socket.get('name', function (err, name) {
                
            console.log ('>>> GET SOCKET ID ' + socket.id + ' - NAME ' + name);
            
            if(name == text.client_id) {
                
                io.sockets.socket(socket.id).emit('num', text);
                console.log ('>>> SENT MESSAGE TO SOCKET ID ' + socket.id + ' - NAME ' + name + ' - client_id ' + text.client_id + ' - text ' +  JSON.stringify(text)) ;
                
            }
            else    {
                console.log ('>>> MESSAGE NOT SENT');
            }
                
        });
         
    });
    
    StatModel.on('change', function(statRes) {
        
        var text = statRes;
        console.log ('-------------------------------------------------'); 
        console.log ('>>> STATMODEL CHANGE EVENT FIRED'); 
        console.log ('>>> NUMSOCKETS ' + sockets.length); 
        console.log ('>>> client_id ' + text.client_id);
        
        socket.get('name', function (err, name) {
                
            console.log ('>>> GET SOCKET ID ' + socket.id + ' - NAME ' + name);
            
            if(name == text.client_id) {
                
                io.sockets.socket(socket.id).emit('num', text);
                console.log ('>>> SENT MESSAGE TO SOCKET ID ' + socket.id + ' - NAME ' + name + ' - client_id ' + text.client_id + ' - text ' +  JSON.stringify(text)) ;
                
            }
            else    {
                console.log ('>>> MESSAGE NOT SENT');
            }
                
        });
         
    });
    
});
