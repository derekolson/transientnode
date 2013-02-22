var canvas;
var ctx;
var w = 0;
var h = 0;
var touches = [];
//var touches = {};

var socket = io.connect("/");

function startSocket() {
	socket.on('msg', function (data) {
	});
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function animloop(){
  requestAnimFrame(animloop);
  render();
}


function init() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	w = window.innerWidth;
	h = window.innerHeight;

	canvas.style.width = w+'px';
	canvas.style.height = h+'px';
	canvas.width = w;
	canvas.height = h;

	canvas.addEventListener('touchstart', onTouchStart);
	canvas.addEventListener('touchmove', onTouchMove);
	canvas.addEventListener('touchend', onTouchEnd);

	animloop();
	startSocket();
}

function onTouchStart(event) {
	event.preventDefault();
  	var newTouches = event.changedTouches;

	var i, len = newTouches.length;
	for (i=0; i<len; i++) {
		var touch = newTouches[i];
		
		touches[touch.identifier] = touch;
		sendNote(touch);
	}

}

function onTouchMove(event) {
	event.preventDefault();
  	var changedTouches = event.changedTouches;

	var i, len = changedTouches.length;
	for (i=0; i<len; i++) {
		var touch = changedTouches[i];
		touches[touch.identifier] = touch;
		sendNote(touch);
	}
}

function onTouchEnd(event) {
	console.log(event);
	var removedTouches = event.changedTouches;
	var i, len = removedTouches.length;
	for (i=0; i<len; i++) {

		var touch = removedTouches[i];
		delete touches[touch.identifier];

		//console.log(touch, j);
		sendNoteOff(touch);
	}
}

function sendNote(touch) {
	var id = touch.identifier;
	var px = touch.pageX/w;
	var py = touch.pageY/h;

	socket.emit('touch', {id:id, x:px, y:py});
	//socket.emit('noteOn', {id:id, x:px, y:py});
}

function sendNoteOff(touch) {
	var id = touch.identifier;
	var px = touch.pageX/w;
	var py = touch.pageY/h;

	socket.emit('touchend', {id:id, x:px, y:py});
}

function render() {
	ctx.clearRect(0, 0, w, h);

	//var i, len = touches.length;
	//for (i=0; i<len; i++) {
	var i;
	for(i in touches) {
		var touch = touches[i];
		var px = touch.pageX;
		var py = touch.pageY;

		ctx.beginPath();
		ctx.arc(px, py, 20, 0, 2*Math.PI, true);

		ctx.fillStyle = "rgba(0, 0, 200, 0.2)";
		ctx.fill();

		ctx.lineWidth = 2.0;
		ctx.strokeStyle = "rgba(0, 0, 200, 0.8)";
		ctx.stroke();
	}
}