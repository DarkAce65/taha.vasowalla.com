'use strict';

window.requestAnimFrame =
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};

document.addEventListener('DOMContentLoaded', function(e) {
	function fillRadius(x, y) {
		var w = Math.max(x, canvas.width - x);
		var h = Math.max(y, canvas.height - y);

		return Math.sqrt(w * w + h * h);
	}

	var canvas = document.querySelector('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = '#121212';
	ctx.strokeStyle = 'whitesmoke';
	ctx.lineWidth = 20;
	var circle = {
		x: 0,
		y: 0,
		r: 0
	};

	document.addEventListener('click', function(e) {
		const x = e.clientX;
		const y = e.clientY;
		circle.x = x;
		circle.y = y;
		const r = fillRadius(x, y);

		const animation = anime({
			targets: circle,
			r: r,
			duration: 1000,
			easing: 'easeInOutQuart',
			begin: function() {
				document.body.classList.add('revealing');
				document.body.classList.remove('invisible');
			},
			update: function() {
				ctx.beginPath();
				ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.strokeRect(0, 0, canvas.width, canvas.height);
			},
			complete: function() {
				document.body.classList.remove('revealing');
			}
		});
	}, {once: true});

	window.addEventListener('resize', function(e) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	});
});
