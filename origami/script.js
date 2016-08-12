function openPhotoSwipe(targetIndex) {
	targetIndex = (typeof targetIndex === 'undefined') ? 0 : targetIndex;
	photoswipeOptions.index = targetIndex;
	photoswipeOptions.history = (window.innerWidth < 768);
	gallery = new PhotoSwipe(document.querySelector(".pswp"), PhotoSwipeUI_Default, photoswipeData, photoswipeOptions);
	gallery.init();
}

var gallery;
var photoswipeOptions = {history: false, loop: false, index: 0, closeOnScroll: false, closeOnVerticalDrag: false,
	getThumbBoundsFn: function(index){
		var bounds = $(".card img")[index].getBoundingClientRect();
		return {x: bounds.left, y: bounds.top + $(window).scrollTop(), w: bounds.width};
	}
};
var photoswipeData = [
	{
		src: "img/PHiZZDodecahedron.jpg", w: 1478, h: 980,
		title: ["Dodecahedron", "Designed by Tom Hull", "Made from 30 PHiZZ Units"]
	},
	{
		src: "img/PHiZZTruncatedIcosahedron.jpg", w: 1478, h: 980,
		title: ["Truncated Icosahedron", "Designed by Tom Hull", "Made from 90 PHiZZ Units"]
	},
	{
		src: "img/PHiZZTorus.jpg", w: 1478, h: 980,
		title: ["Torus", "Designed by Tom Hull", "Made from 360 PHiZZ Units"]
	},
	{
		src: "img/SonobeCube.jpg", w: 1478, h: 980,
		title: ["Cube", "Designed by Mitsunobu Sonobe", "Made from 6 Sonobe Units"]
	},
	{
		src: "img/SonobeStellatedOctahedron.jpg", w: 1478, h: 980,
		title: ["Stellated Octahedron", "Designed by Mitsunobu Sonobe", "Made from 12 Sonobe Units"]
	},
	{
		src: "img/SonobeStellatedIcosahedron.jpg", w: 1478, h: 980,
		title: ["Stellated Icosahedron", "Designed by Mitsunobu Sonobe", "Made from 30 Sonobe Units"]
	},
	{
		src: "img/WhirlCube.jpg", w: 1478, h: 980,
		title: ["Whirl Cube", "Designed by Meenakshi Mukerji", "Made from 24 Units"]
	},
	{
		src: "img/Convertible_(Front).jpg", w: 1478, h: 980,
		title: ["Convertible", "Designed by Jason Ku", "One sheet of paper, double-sided"]
	},
	{
		src: "img/Convertible_(Back).jpg", w: 1478, h: 980,
		title: ["Convertible", "Designed by Jason Ku", "One sheet of paper, double-sided"]
	},
	{
		src: "img/Name_(Top).jpg", w: 1478, h: 980,
		title: ["My Name", "Letters designed by Jo Nakashima", "One sheet of paper per letter"]
	},
	{
		src: "img/Name_(Front).jpg", w: 1478, h: 980,
		title: ["My Name", "Letters designed by Jo Nakashima", "One sheet of paper per letter"]
	},
	{
		src: "img/Tanks.jpg", w: 1478, h: 980,
		title: ["Tanks", "Designed by Jo Nakashima", "Two pieces of paper per tank"]
	}
];

$(function() {
	for(var i = 0; i < photoswipeData.length; i++) {
		var titleData = photoswipeData[i].title;
		var caption = '<div class="caption"><div class="title">' + titleData[0] + '</div>';
		for(var j = 1; j < titleData.length; j++)  {
			caption += '<div>' + titleData[j] + '</div>';
		}
		caption += '</div>';
		photoswipeData[i].title = caption;
	}
});