var cardOpacity = 1;
var cardCount = 60;
var delay = 5 / cardCount;
var current = "random";

var backgroundTimeline, colorTimeline, animationTimeline;

function resize() { // Resize function
	height = $("#animationContainer").height();
	width = $("#animationContainer").width();

	var cardHeight = Math.min(90, Math.floor(height * 0.15));
	var cardWidth = Math.min(40, Math.floor(width * 0.05));

	$(".card").css({
		"height": cardHeight,
		"width": cardWidth,
		"margin-top": -cardHeight / 2,
		"margin-left": -cardWidth / 2
	});
}

function pile(elements, offset) { // Pile orientation
	current = "pile"; // Set the current orientation
	offset = (typeof offset === "undefined") ? 0 : offset;
	animationTimeline.staggerTo(elements, 1, {
			cycle: {
				y: function(index) {
					return height - (index + offset) / 2 + 60;
				}
			},
			x: width / 4,
			z: 0,
			rotationX: 90,
			rotationY: 0,
			rotationZ: 0
		},
		delay,
		animationTimeline.time()
	);
}

function cylinder(elements, offset) { // Cylinder orientation
	current = "cylinder";
	offset = (typeof offset === "undefined") ? 0 : offset;
	$.each(elements, function(index, value) {
		var radiusOffset = Math.floor((index + offset) / 60);
		var radius = Math.max(0, width / 4 - radiusOffset * width / 30);
		var angle = ((index + offset) % 10) / 10 * 2 * Math.PI;
		var px = Math.cos(angle) * radius;
		var pz = Math.sin(angle) * radius;
		var py = Math.floor(((index + offset) - radiusOffset * 60) / 10) * $(".card").height() * 1.1 + 60;
		animationTimeline.to(value, 1, {x: px, y: py, z: pz, rotationX: 0, rotationY: 90 - angle * 180 / Math.PI, rotationZ: 0, delay: index * delay}, animationTimeline.time());
	});
}

function sphere(elements, offset) { // Sphere orientation
	current = "sphere";
	offset = (typeof offset === "undefined") ? 0 : offset;
	$.each(elements, function(index, value) {
		var phi = Math.acos(-1 + (2 * (index + offset)) / cardCount);
		var theta = Math.sqrt(cardCount * Math.PI) * phi;
		var px = Math.min(width / 6, height / 3) * Math.cos(theta) * Math.sin(phi);
		var py = Math.min(width / 6, height / 3) * Math.sin(theta) * Math.sin(phi) + height / 2 + Math.min(width / 6, height / 3);
		var pz = Math.min(width / 6, height / 3) * Math.cos(phi);
		animationTimeline.to(value, 1, {x: px, y: py, z: pz, rotationX: 0, rotationY: 0, rotationZ: 0, delay: index * delay}, animationTimeline.time());
	});
}

function fan(elements, offset) { // Fan orientation
	current = "fan";
	offset = (typeof offset === "undefined") ? 0 : offset;
	var radius = Math.min(width / 4, height / 4);
	$.each(elements, function(index, value) {
		var angle = -(index + offset) / cardCount * Math.PI;
		var px = Math.cos(angle) * radius;
		var py = Math.sin(angle) * radius + height;
		var pz = (index + offset) / 5;
		animationTimeline.to(value, 1, {x: px, y: py, z: pz, rotationX: 0, rotationY: 0, rotationZ: 90 + angle * 180 / Math.PI, delay: index * delay}, animationTimeline.time());
	});
}

function drop(elements) { // Drop to floor
	current = "drop";
	animationTimeline.staggerTo(elements, 1, {
			cycle: {
				x: function() {
					var transform = this._gsTransform || {x: 0};
					return transform.x + Math.random() * 50 - 25;
				},
				z: function() {
					var transform = this._gsTransform || {z: 0};
					return transform.z + Math.random() * 50 - 25;
				},
				rotationX: function() {
					return (Math.random() < 0.5) ? 90 : -90;
				},
				rotationY: function() {
					var transform = this._gsTransform || {rotationY: 0};
					return transform.rotationY + Math.random() * 120 - 60;
				}
			},
			y: height + 60,
			rotationZ: 0,
			ease: Bounce.easeOut
		},
		0.3 / cardCount,
		animationTimeline.time()
	);
}

function randomPosition(elements) { // Random orientation
	current = "random";
	animationTimeline.staggerTo(elements, 1, {
			cycle: {
				x: function() {
					return Math.random() * width / 2 - width / 4;
				},
				y: function() {
					return Math.random() * height + 60;
				},
				z: function() {
					return Math.random() * width / 2 - width / 4;
				},
				rotationY: function() {
					return Math.random() * 720 - 360;
				}
			},
			rotationX: 0,
			rotationZ: 0
		},
		delay,
		animationTimeline.time()
	);
}

function shuffle(array) { // Fisher–Yates Shuffle
	var m = array.length, t, i;
	while(m) {
		i = Math.floor(Math.random() * m--);
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}
	return array;
}

$(function() {
	height = $("#animationContainer").height();
	width = $("#animationContainer").width();

	backgroundTimeline = new TimelineMax();
	backgroundTimeline.to($("#animation"), 20, {rotationY: -360, repeat: -1, ease: Linear.easeNone}); // Infinite spin

	colorTimeline = new TimelineMax();
	animationTimeline = new TimelineMax();

	for(var i = 0; i < cardCount; i++) {
		$("#animation").append('<div class="card" style="background: hsl(' + i * 360 / cardCount + ', 100%, 50%);"></div>');
	};

	animationTimeline.to(".card", .5, {y: 60}, 0) // Move to random positions
		.staggerTo(".card", 1, {
			cycle: {
				x: function() {
					return Math.random() * width / 2 - width / 4;
				},
				y: function() {
					return Math.random() * height + 60;
				},
				z: function() {
					return Math.random() * width / 2 - width / 4;
				},
				rotationY: function() {
					return Math.random() * 720 - 360;
				}
			}
		},
		0.05
	);

	resize();

	$("#cardCountContainer").click(function() { // Change opacity
		cardOpacity = (cardOpacity == 1) ? 0.5 : 1;
		backgroundTimeline.to(".card", 2, {opacity: cardOpacity}, backgroundTimeline.time());
	});

	$("a#add, button#add").click(function() { // Add 30 cards
		if(window.innerWidth > 767 || (window.innerWidth < 768 && cardCount < 240)) {
			cardCount += 30;
			$("#cardCount").html(cardCount);
			delay = 5 / cardCount;

			newCards = [];
			for(var i = 0; i < 30; i++) {
				newCards.push($('<div class="card"></div>'));
			}
			$("#animation").append(newCards);
			animationTimeline.set(newCards, {y: 60, opacity: cardOpacity}, animationTimeline.time());

			resize();
			switch(current) {
				case "pile":
					pile(newCards, cardCount - 30);
					break;
				case "cylinder":
					cylinder(newCards, cardCount - 30);
					break;
				case "sphere":
					animationTimeline.clear();
					sphere($(".card:not(.dead)"));
					break;
				case "fan":
					animationTimeline.clear();
					fan($(".card:not(.dead)"));
					break;
				case "drop":
					drop(newCards);
					break;
				case "random":
					randomPosition(newCards);
					break;
			}

			colorTimeline.clear();
			colorTimeline.to(".card:not(.dead)", 1, {backgroundColor: "hsl(0, 100%, 50%)"}).staggerTo(".card:not(.dead)", 1, {
					cycle: {
						backgroundColor: function(i) {
							return "hsl(" + i * 360 / cardCount + ", 100%, 50%)";
						}
					}
				},
				0.01
			);

			$("button#remove").removeClass("disabled");
			$("a#remove").parent().removeClass("disabled");
			if(cardCount === 240) {
				$("a#add").parent().addClass("disabled");
			}
		}
	});

	$("a#remove, button#remove").click(function() { // Remove 30 cards
		if(cardCount > 60) {
			animationTimeline.clear();
			cardCount -= 30;
			delay = 5 / cardCount;

			var killedElements = $(shuffle($(".card:not(.dead)")).slice(0, 30));
			killedElements.addClass("dead");
			backgroundTimeline.to(killedElements, 0.1, {rotationX: 0}, backgroundTimeline.time());
			backgroundTimeline.to(killedElements, 1, {y: 0, opacity: 0, ease: Power1.easeIn, onComplete: function() {
				this.target.remove();
				$("#cardCount").html(cardCount);
				colorTimeline.clear();
				colorTimeline.staggerTo(".card:not(.dead)", 1, {
						cycle: {
							backgroundColor: function(i) {
								return "hsl(" + i * 360 / cardCount + ", 100%, 50%)";
							}
						}
					},
					0.01
				);
			}}, backgroundTimeline.time());

			resize();
			switch(current) {
				case "pile":
					pile($(".card:not(.dead)"));
					break;
				case "cylinder":
					cylinder($(".card:not(.dead)"));
					break;
				case "sphere":
					sphere($(".card:not(.dead)"));
					break;
				case "fan":
					fan($(".card:not(.dead)"));
					break;
			}

			$("a#add").parent().removeClass("disabled");
			if(cardCount === 60) {
				$("button#remove").addClass("disabled");
				$("a#remove").parent().addClass("disabled");
			}
		}
	});

	$("a#pile, button#pile").click(function() { // Pile button click
		animationTimeline.clear(); // Stop all animations
		resize(); // Resize cards
		pile($(".card:not(.dead)")); // Position cards
	});

	$("a#cylinder, button#cylinder").click(function() { // Cylinder button click
		animationTimeline.clear();
		resize();
		cylinder($(".card:not(.dead)"));
	});

	$("a#sphere, button#sphere").click(function() { // Sphere button click
		animationTimeline.clear();
		resize();
		sphere($(".card:not(.dead)"));
	});

	$("a#fan, button#fan").click(function() { // Fan button click
		animationTimeline.clear();
		resize();
		fan($(".card:not(.dead)"));
	});

	$("a#drop, button#drop").click(function() { // Drop button click
		if(current !== "drop") {
			animationTimeline.clear();
			resize();
			drop(shuffle($(".card:not(.dead)")));
		}
	});

	$("a#random, button#random").click(function() { // Random button click
		animationTimeline.clear();
		resize();
		randomPosition(shuffle($(".card:not(.dead)")));
	});
});