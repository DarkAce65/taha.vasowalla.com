"use strict";

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
	var c = 0;
	var width = window.innerWidth;
	var height = window.innerHeight;

	var canvas = document.querySelector('#background');
	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext('2d');
	ctx.strokeStyle = 'white';

	function render() {
		ctx.beginPath();
		ctx.arc(width / 2, height / 2, c % (width / 2), 0, 2 * Math.PI);
		ctx.stroke();

		c++;

		requestAnimFrame(render);
	}

	render();

	window.addEventListener('resize', function(e) {
		width = window.innerWidth;
		height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;
	});
});
