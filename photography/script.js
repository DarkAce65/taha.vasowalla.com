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
var photoswipeOptions = {history: false, loop: false, index: 0, closeOnScroll: false, closeOnVerticalDrag: false, showHideOpacity: true,
	getThumbBoundsFn: function() {
		var bounds = psThumb.getBoundingClientRect();
		return {x: bounds.left, y: bounds.top, w: bounds.width};
	}
};
var photoswipeData = { // Title, Date, Camera, Exposure, Aperture (ƒ), Focal Length, ISO
	photos: [
		{
			src: "img/IMG_20150907_155454929.jpg", w: 1000, h: 1333,
			title: ["", "9/7/2015", "Droid Turbo", "1/40", "ƒ/2.0", "4.8mm", "500"]
		},
		{
			src: "img/IMG_20150907_154040989_HDR.jpg", w: 1000, h: 1333,
			title: ["", "9/7/2015", "Droid Turbo", "1/60", "ƒ/2.0", "4.8mm", "80"]
		},
		{
			src: "img/IMG_20150605_195040427.jpg", w: 1000, h: 563,
			title: ["", "6/5/2015", "Droid Turbo", "1/320", "ƒ/2.0", "4.8mm", "50"]
		},
		{
			src: "img/IMG_20150522_200247966.jpg", w: 1000, h: 563,
			title: ["", "5/22/2015", "Droid Turbo", "1/400", "ƒ/2.0", "4.8mm", "50"]
		}
	],
	instagram: [
		{
			src: "instagram/IMG_20151015_165133.jpg", w: 3936, h: 3936,
			title: ["Autumn flyby", "10/15/2015", "Droid Turbo", "1/40", "ƒ/2.0", "4.8mm", "160"]
		},
		{
			src: "instagram/IMG_20150825_222731.jpg", w: 3721, h: 3721,
			title: ["Sunbeams at sunset", "8/25/2015", "Droid Turbo", "1/1000", "ƒ/2.0", "4.8mm", "50"]
		},
		{
			src: "instagram/IMG_20150825_103928.jpg", w: 1971, h: 1971,
			title: ["\"For Clarity\"", "8/25/2015", "Droid Turbo", "1/320", "ƒ/2.0", "4.8mm", "50"]
		},
		{
			src: "instagram/IMG_20150801_213237.jpg", w: 2950, h: 2950,
			title: ["A parking lot without glasses", "8/1/2015", "Droid Turbo", "1/15", "ƒ/2.0", "4.8mm", "1600"]
		},
		{
			src: "instagram/IMG_20150727_181229.jpg", w: 1944, h: 1944,
			title: ["Origami T-Rex and velociraptor", "7/27/2015", "Droid Turbo", "1/40", "ƒ/2.0", "4.8mm", "100"]
		},
		{
			src: "instagram/IMG_20150713_014612.jpg", w: 2899, h: 2899,
			title: ["A single glowing wisp", "7/13/2015", "Droid Turbo", "1/60", "ƒ/2.0", "4.8mm", "64"]
		},
		{
			src: "instagram/IMG_20150710_151818.jpg", w: 1944, h: 1944,
			title: ["Sitting on the armrest", "7/10/2015", "Droid Turbo", "--", "ƒ/2.0", "4.8mm", "--"]
		},
		{
			src: "instagram/IMG_20150602_212233.jpg", w: 1870, h: 1870,
			title: ["Down the wing", "6/2/2015", "Droid Turbo", "--", "ƒ/2.0", "4.8mm", "--"]
		},
		{
			src: "instagram/IMG_20150602_211936.jpg", w: 1870, h: 1870,
			title: ["Boston skyline", "6/2/2015", "Droid Turbo", "--", "ƒ/2.0", "4.8mm", "--"]
		},
		{
			src: "instagram/IMG_20150525_164257.jpg", w: 1822, h: 1822,
			title: ["Homebound plane", "5/25/2015", "Droid Turbo", "--", "ƒ/2.0", "4.8mm", "--"]
		},
		{
			src: "instagram/IMG_20150522_204352.jpg", w: 1870, h: 1870,
			title: ["Sunset horizon", "5/22/2015", "Droid Turbo", "--", "ƒ/2.0", "4.8mm", "--"]
		},
		{
			src: "instagram/IMG_20150522_192851.jpg", w: 1622, h: 1622,
			title: ["Terminal A", "5/22/2015", "Droid Turbo", "--", "ƒ/2.0", "4.8mm", "--"]
		},
		{
			src: "instagram/IMG_20150520_202217.jpg", w: 1622, h: 1622,
			title: ["Rainbow sunset", "5/20/2015", "Droid Turbo", "--", "ƒ/2.0", "4.8mm", "--"]
		},
		{
			src: "instagram/IMG_20150515_021628.jpg", w: 1390, h: 1390,
			title: ["Flames of a 2am snack", "5/15/2015", "Droid Turbo", "--", "ƒ/2.0", "4.8mm", "--"]
		},
		{
			src: "instagram/IMG_20150514_160458.jpg", w: 1622, h: 1622,
			title: ["Grass forest", "5/14/2015", "Droid Turbo", "--", "ƒ/2.0", "4.8mm", "--"]
		},
		{
			src: "instagram/IMG_20150513_151903.jpg", w: 1809, h: 1809,
			title: ["Down the keys", "5/13/2015", "Droid Turbo", "--", "ƒ/2.0", "4.8mm", "--"]
		},
		{
			src: "instagram/IMG_20150513_101707.jpg", w: 1822, h: 1822,
			title: ["Fancy lighting on stage", "5/13/2015", "Droid Turbo", "--", "ƒ/2.0", "4.8mm", "--"]
		}
	]
};

$(function() {
	for(var key in photoswipeData) {
		var albumData = photoswipeData[key];
		var albumTitle = key.replace(/\b[A-Za-z]/, function(letter){return letter.toUpperCase();});
		$("#gallery").append('<div class="col-xs-6 col-sm-3"><div class="psAlbum" data-album="' + key + '" data-index="0" onclick="openPhotoSwipe(this)"><div class="psThumbnail" style="background-image: url(' + albumData[0].src + ')"></div><div class="title">' + albumTitle + '</div></div></div>');
		for(var i = 0; i < photoswipeData[key].length; i++) {
			var titleData = photoswipeData[key][i].title;
			photoswipeData[key][i].title = '<div class="caption"><div class="title">' + titleData[0] + '</div><div>' + titleData[1] + '</div><div><i class="fa fa-camera"></i>' + titleData[2] + '</div><div class="grid"><span><i class="photoicon photoicon-aperture"></i>' + titleData[3] + '</span><span><i class="photoicon photoicon-exposure"></i>' + titleData[4] + '</span><span><i class="photoicon photoicon-focal-length"></i>' + titleData[5] + '</span><span><i class="photoicon photoicon-iso"></i>' + titleData[6] + '</span></div></div>';
		}
	}

	$('.psAlbum[data-album="instagram"]').append('<div class="subtitle">@darkace65</div>');
});