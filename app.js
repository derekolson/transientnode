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
    var touchObj = translateTouch(touch);
    sendNoteOn(touchObj.note, touchObj.vel);
    touches[touch.id] = touchObj;
  });

  socket.on('touchmove', function (touch) {
    //console.log(touch);
    var touchObj = translateTouch(touch);
    if(touches[touch.id] == null || touches[touch.id].note != touchObj.note) {
      sendNoteOff(touches[touch.id].note, touchObj.vel);
      sendNoteOn(touchObj.note, touchObj.vel);
      touches[touch.id] = touchObj;
    }

  });

  socket.on('touchend', function (touch) {
    //console.log(touch);
    var touchObj = touches[touch.id];
    sendNoteOff(touchObj.note, touchObj.vel);
    delete touches[touch.id];
  });

  socket.on('scale', function (scale) {
    //console.log(scale);
    var newScale = SCALES[scale];
    currentScale = newScale;
  });

});

//// MIDI OUTPUT ////
const NOTE_NAMES = ["C","C#/Db","D","D#/Eb","E","F","F#/Gb","G","G#/Ab","A","A#/Bb","B" ];
const SCALES = {
  CHROMATIC: [0,1,2,3,4,5,6,7,8,9,10,11],
  MAJOR:[0,2,4,5,7,9,11],
  MAJOR_PENT: [0,2,4,7,9],
  MINOR: [0,2,3,5,7,9,11],
  HARMONIC_MINOR: [0,2,3,5,7,8,11],
  MINOR_PENT: [0,3,5,7,10],
  BLUES: [0,3,5,6,7,10],
  BEBOP: [0,2,4,5,7,9,10,11],
  DORIAN: [0,2,3,5,7,9,10]
}

var touches = [];
var currentScale = SCALES.BLUES;
var currentKey = 0;
var numOctaves = 7;
var offsetOctaves = 2;

var output = new midi.output();
output.openPort(0);

//Translate normalized X & Y to appropriate number of octaves/velocity
function translateTouch(touch) {
  var note = Math.floor(touch.x * currentScale.length * numOctaves) + (currentScale.length * offsetOctaves);
  var vel = Math.floor(128 - (touch.y * 128));

  note = processTheory(note, currentScale, currentKey);
  return {note: note, vel: vel};
}

function processTheory(inNote, scale, key) {
  var outNote = (Math.floor(inNote / scale.length) * 12) + scale[inNote % scale.length] + key;
  return outNote;
}

function sendNoteOn(note, vel) {
  output.sendMessage([0x90,note,vel]);
}

function sendNoteOff(note, vel) {
  output.sendMessage([0x80,note,vel]);
}






