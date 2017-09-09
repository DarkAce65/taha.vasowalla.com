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
		var w = Math.max(x, window.innerWidth - x);
		var h = Math.max(y, window.innerHeight - y);

		return Math.sqrt(w * w + h * h);
	}

	document.addEventListener('click', function(e) {
		const x = e.clientX;
		const y = e.clientY;
		const circle = document.querySelector('circle');
		circle.setAttribute('cx', x);
		circle.setAttribute('cy', y);
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
			complete: function() {
				document.body.classList.remove('revealing');
			}
		});
	}, {once: true});
});
