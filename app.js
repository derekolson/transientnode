var express = require('express')
  , routes = require('./routes')
  , http = require('http')

var midi = require('midi');

// Express config
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8000);
  app.set('views', __dirname + '/views');
  //app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/', routes.index);

// Start HTTP/Express Server
var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Server listening on port " + app.get('port'));
});

// Socket.io config
var io = require('socket.io').listen(server);

io.configure(function () { 
  //io.set('transports', ['xhr-polling']); 
  //io.set('polling duration', 10);
  io.set('log level', 1);
});

io.sockets.on('connection', function (socket) {
  console.log('socket connected');

  socket.on('touch', function (data) {
    console.log(data);
    var note = data.x * 127;
    var vel = 127 - (data.y * 127);
    output.sendMessage([144,note,100]);
  });

  socket.on('touchend', function (data) {
    console.log(data);
    //var note = data.x * 127;
    //var vel = 127 - (data.y * 127);
    //output.sendMessage([144,note,vel]);
  });

});


var output = new midi.output();

//console.log(output.getPortCount());
console.log(output.getPortName(0));
output.openPort(0);

// Send a MIDI message.
//output.sendMessage([176,22,1]);