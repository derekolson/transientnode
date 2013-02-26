var canvas;
var ctx;
var w = 0;
var h = 0;
var touches = [];

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
		sendTouchStart(touch);
	}

}

function onTouchMove(event) {
	event.preventDefault();
  	var changedTouches = event.changedTouches;

	var i, len = changedTouches.length;
	for (i=0; i<len; i++) {
		var touch = changedTouches[i];
		touches[touch.identifier] = touch;
		sendTouchMove(touch);
	}
}

function onTouchEnd(event) {
	event.preventDefault();
	var removedTouches = event.changedTouches;
	var i, len = removedTouches.length;
	for (i=0; i<len; i++) {

		var touch = removedTouches[i];
		delete touches[touch.identifier];
		sendTouchEnd(touch);
	}
}

function sendTouchStart(touch) {
	var id = touch.identifier;
	var px = touch.pageX/w;
	var py = touch.pageY/h;

	socket.emit('touchstart', {id:id, x:px, y:py});
}

function sendTouchMove(touch) {
	var id = touch.identifier;
	var px = touch.pageX/w;
	var py = touch.pageY/h;

	socket.emit('touchmove', {id:id, x:px, y:py});
}

function sendTouchEnd(touch) {
	var id = touch.identifier;
	var px = touch.pageX/w;
	var py = touch.pageY/h;

	socket.emit('touchend', {id:id, x:px, y:py});
}

function clearTouches() {
	for(var id in touches) {
		var touch = touches[i];
		sendTouchEnd(touch);
		delete touches[id];
	}
}

function render() {
	ctx.clearRect(0, 0, w, h);

	for(var id in touches) {
		var touch = touches[id];
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