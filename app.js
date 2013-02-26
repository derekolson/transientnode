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
const NOTE_NAMES = ["C","C#/Db","D","D#/Eb","E","F","F#/Gb","G","G#/Ab","A","A#/Bb","B" ];
const CHROMATIC = [0,1,2,3,4,5,6,7,8,9,10,11]
const MAJOR = [0,2,4,5,7,9,11];
const MAJOR_PENT = [0,2,4,7,9];
const MINOR = [0,2,3,5,7,9,11];
const HARMONIC_MINOR = [0,2,3,5,7,8,11];
const MINOR_PENT = [0,3,5,7,10];
const BLUES = [0,3,5,6,7,10];
const BEBOP = [0,2,4,5,7,9,10,11];
const DORIAN = [0,2,3,5,7,9,10];

var notes = [];
var currentScale = DORIAN;
var currentKey = 0;
var numOctaves = 8;
var offsetOctaves = 1;

var output = new midi.output();
output.openPort(0);

function translateNote(touch) {
  var note = Math.floor(touch.x * currentScale.length * numOctaves) + (currentScale.length * offsetOctaves);
  var vel = Math.floor(128 - (touch.y * 128));

  note = processTheory(note, currentScale, currentKey);
  return {note: note, vel: vel};
}

function sendNoteOn(note, vel) {
  output.sendMessage([0x90,note,vel]);
}

function sendNoteOff(note, vel) {
  output.sendMessage([0x80,note,vel]);
}

function processTheory(inNote, scale, key) {
  var outNote = (Math.floor(inNote / scale.length) * 12) + scale[inNote % scale.length] + key;
  return outNote;
}





