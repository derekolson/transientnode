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

  socket.on('touchstart', function (touch) {
    //console.log(touch);
    var note = translateNote(touch);
    notes[touch.id] = note;
    sendNoteOn(note.note, note.vel);
  });

  socket.on('touchmove', function (touch) {
    //console.log(touch);
    var note = translateNote(touch);
    if(notes[touch.id] == null || notes[touch.id].note != note.note) {
      sendNoteOff(notes[touch.id].note, note.vel);
      sendNoteOn(note.note, note.vel);
      notes[touch.id] = note;
    }

  });

  socket.on('touchend', function (touch) {
    //console.log(touch);
    var note = translateNote(touch);
    sendNoteOff(note.note, note.vel);
  });

});

//// MIDI OUTPUT ////
var output = new midi.output();
output.openPort(0);

var notes = [];

function translateNote(touch) {
  var note = Math.floor(touch.x * 127);
  var vel = Math.floor(127 - (touch.y * 127));
  return {note: note, vel: vel};
}

function sendNoteOn(note, vel) {
  output.sendMessage([0x90,note,vel]);
}

function sendNoteOff(note, vel) {
  output.sendMessage([0x80,note,vel]);
}




