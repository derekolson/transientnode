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

	console.log(event.touches);
	socket.emit('touch', { touch: 'data' });

}

function onTouchMove(event) {
	event.preventDefault();
  	touches = event.touches;


}

function onTouchEnd(event) {

}

function render() {
	ctx.clearRect(0, 0, w, h);

	var i, len = touches.length;
	for (i=0; i<len; i++) {
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