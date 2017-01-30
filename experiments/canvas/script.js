"use strict";

var bubblesCanvas, bubblesCtx;
var rainCanvas, rainCtx;

var animateBubbles = false;
var bubbles = [];

var animateRain = false;
var raindrops = [], drops = [];
var wind = 0.015;
var gravity = 0.2;
var rain_chance = 0.3;

window.requestAnimFrame =
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};

var Vector = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

Vector.prototype.copy = function() {
	return new Vector(this.x, this.y);
};

var Bubble = function(x, y) {
	this.radius = Math.random() * 14 + 6;
	this.position = new Vector(x, y + this.radius);
	this.velocity = new Vector(0, -Math.random() / 2);
	this.opacity = Math.random() * 0.7 + 0.1;
};

Bubble.prototype.update = function() {
	this.position.y = this.position.y + this.velocity.y;
	this.opacity = this.opacity - 0.0005;
};

Bubble.prototype.draw = function() {
	bubblesCtx.beginPath();
	bubblesCtx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
	bubblesCtx.closePath();
	bubblesCtx.fillStyle = "rgba(185, 211, 238," + this.opacity + ")";
	bubblesCtx.fill();
};

function updateBubbles() {
	if(animateBubbles) {
		bubblesCtx.clearRect(0, 0, bubblesCanvas.width, bubblesCanvas.height);
		for(var i = 0; i < bubbles.length; i++) {
			if(bubbles[i].position.y + bubbles[i].radius < 0 || bubbles[i].opacity < 0.01) {
				bubbles[i] = new Bubble(Math.random() * bubblesCanvas.width, Math.random() * 150 + 10 + bubblesCanvas.height);
			}
			else {
				bubbles[i].update();
			}
			bubbles[i].draw();
		}
		requestAnimFrame(updateBubbles);
	}
}

var Raindrop = function() {
	this.position = new Vector(Math.random() * rainCanvas.width, 0);
	this.prev = this.position;
	this.velocity = new Vector(0, -Math.random() * 12);
	this.drops = Math.round(Math.random() * 4 + 2);
};

Raindrop.prototype.update = function() {
	this.prev = this.position.copy();
	this.velocity.y += gravity;
	this.velocity.x += wind;
	this.position.x = this.position.x + this.velocity.x;
	this.position.y = this.position.y + this.velocity.y;
};

var Drop = function(x, y) {
	var dist = Math.random() * 5;
	var angle = Math.PI + Math.random() * Math.PI;
	this.position = new Vector(x, y);
	this.velocity = new Vector(
		Math.cos(angle) * dist,
		Math.sin(angle) * dist
	);
};

Drop.prototype.update = function() {
	this.velocity.y += gravity;
	this.velocity.x *= 0.95;
	this.position.x = this.position.x + this.velocity.x;
	this.position.y = this.position.y + this.velocity.y;
};

function updateRain() {
	if(animateRain) {
		rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
		rainCtx.strokeStyle = "rgb(60, 135, 235)";
		rainCtx.lineWidth = 3;
		rainCtx.beginPath();
		for(var i = 0; i < raindrops.length; i++) {
			var rain = raindrops[i];
			rain.update();
			rainCtx.moveTo(rain.prev.x, rain.prev.y);
			rainCtx.lineTo(rain.position.x, rain.position.y);
			if(rain.position.x < 0) {
				rain.prev.x += rainCanvas.width;
				rain.position.x += rainCanvas.width;
			}
			else if(rain.position.x > rainCanvas.width) {
				rain.prev.x -= rainCanvas.width;
				rain.position.x -= rainCanvas.width;
			}
			if(rain.position.y > rainCanvas.height) {
				var n = rain.drops;
				while(n--) {
					drops.push(new Drop(rain.position.x, rainCanvas.height));
				}
				raindrops.splice(i, 1);
				i--;
			}
		}
		rainCtx.fillStyle = "rgb(60, 135, 235)";
		rainCtx.stroke();
		for(var i = 0; i < drops.length; i++) {
			var drop = drops[i];
			drop.update();
			rainCtx.beginPath();
			rainCtx.arc(drop.position.x, drop.position.y, 2, 0, Math.PI * 2, false);
			rainCtx.closePath();
			rainCtx.fill();
			if(drop.position.y > rainCanvas.height) {
				drops.splice(i, 1);
				i--;
			}
		}
		if(Math.random() < rain_chance) {
			raindrops.push(new Raindrop());
		}
		requestAnimFrame(updateRain);
	}
}

$(function() {
	TweenLite.set("#rainDial", {transformOrigin: "50% 50%"});
	Draggable.create("#rainDial", {
		type: "rotation",
		bounds: {minRotation: -135, maxRotation: 135},
		onDrag: function() {
			rain_chance = (this.rotation + 135) / 270;
		}
	});
	TweenLite.set("#rainDial", {rotation: -81});

	rainCanvas = document.querySelector("#rain");
	rainCtx = rainCanvas.getContext("2d");
	rainCanvas.height = $("#rain").height();
	rainCanvas.width = $("#rain").width();

	bubblesCanvas = document.querySelector("#bubbles");
	bubblesCtx = bubblesCanvas.getContext("2d");
	bubblesCanvas.height = $("#bubbles").height();
	bubblesCanvas.width = $("#bubbles").width();
	for(var i = 0; i < $("#bubbles").width() / 3; i++) {
		bubbles[i] = new Bubble(Math.random() * bubblesCanvas.width, Math.random() * 190 + 10 + bubblesCanvas.height);
	}

	$("#rainToggle").click(function() {
		animateRain = !animateRain;
		updateRain();
	});

	$("#bubbleToggle").click(function() {
		animateBubbles = !animateBubbles;
		updateBubbles();
	});

	$(window).resize(function() {
		rainCanvas.height = $("#rain").height();
		rainCanvas.width = $("#rain").width();
		bubblesCanvas.height = $("#bubbles").height();
		bubblesCanvas.width = $("#bubbles").width();
	});
});
