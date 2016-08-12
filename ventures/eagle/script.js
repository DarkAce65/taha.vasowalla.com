function openPhotoSwipe(thumbnail) {
	psThumb = thumbnail;
	photoswipeOptions.index = parseInt($(psThumb).data("index"), 10);
	photoswipeOptions.history = (window.innerWidth < 768);
	gallery = new PhotoSwipe(document.querySelector(".pswp"), PhotoSwipeUI_Default, photoswipeData[$(psThumb).data("album")], photoswipeOptions);
	gallery.init();
	gallery.listen("afterChange", function() {
		var index = gallery.getCurrentIndex();
		var imageUrl = photoswipeData[$(psThumb).data("album")][index].src;
		$(psThumb).find(".psThumbnail").css("background-image", 'url("' + imageUrl + '")');
		$(psThumb).data("index", index);
	});
}

var gallery;
var photoswipeData = {
	photos: [
		{
			src: "img/Sign.jpeg", w: 3264, h: 2448,
			title: ["Reservation Sign"]
		},
		{
			src: "img/Front.jpeg", w: 3264, h: 2448,
			title: ["Parking lot view facing the road", "Before starting work"]
		},
		{
			src: "img/ParkingPanorama.jpeg", w: 5614, h: 2510,
			title: ["Panorama of parking lot", "Before starting work"]
		},
		{
			src: "img/IMG_6501.JPG", w: 2448, h: 3264,
			title: ["Getting materials from Home Depot", "March 21st, 2015", "A big thank you to The Home Depot for the generous donation of lumber"]
		},
		{
			src: "img/DSC_0054.JPG", w: 4928, h: 3264,
			title: ["Constructing the bench", "March 28th, 2015", "Working on the bench for the trailhead"]
		},
		{
			src: "img/IMG_20150328_160351117.jpg", w: 2310, h: 1298,
			title: ["Completed bench", "March 28th, 2015"]
		},
		{
			src: "img/DSC_0095.JPG", w: 4928, h: 3264,
			title: ["Digging holes for fence posts", "Digging Day 1 - April 18th, 2015"]
		},
		{
			src: "img/DSC_0131.JPG", w: 4928, h: 3264,
			title: ["Setting the first post", "Digging Day 1 - April 18th, 2015"]
		},
		{
			src: "img/IMG_6699.JPG", w: 3264, h: 2448,
			title: ["Drilling holes in the posts", "Digging Day 1 - April 18th, 2015"]
		},
		{
			src: "img/DSC_0178.JPG", w: 4928, h: 3264,
			title: ["Mixing concrete to set the bench", "Digging Day 2 - April 23rd, 2015"]
		},
		{
			src: "img/DSC_0172.JPG", w: 4928, h: 3264,
			title: ["Getting gravel to stabilize posts in the water", "Digging Day 2 - April 23rd, 2015", "A big thank you to Alfred J. Cavallaro Inc for the generous donation of gravel"]
		}
	]
};



for(var key in photoswipeData) {
	for(var i = 0; i < photoswipeData[key].length; i++) {
		var titleData = photoswipeData[key][i].title;
		var caption = '<div class="caption"><div class="title">' + titleData[0] + '</div>';
		for(var j = 1; j < titleData.length; j++)  {
			caption += '<div>' + titleData[j] + '</div>';
		}
		caption += '</div>';
		photoswipeData[key][i].title = caption;
	}
}

var photoswipeOptions = {history: false, loop: false, index: 0, closeOnScroll: false, closeOnVerticalDrag: false, showHideOpacity: true,
	getThumbBoundsFn: function() {
		var bounds = psThumb.getBoundingClientRect();
		return {x: bounds.left, y: bounds.top, w: bounds.width};
	}
};