"use strict";

var baseURL = "http://backend.deviantart.com/rss.xml?q=sort:time favby:DarkAce65&offset=0";
var next = null;
var retrieving = $('<div class="cardWrapper col-xs-12 col-sm-8 col-sm-offset-2" style="position: absolute; bottom: 0;"><div class="card"><div class="retrieving"><span class="h4">Retrieving more...</span></div></div></div>');
var gallery, galleryLayout;
var photoswipeData = [];
var photoswipeOptions = {history: false, loop: false, index: 0, closeOnScroll: false, closeOnVerticalDrag: false,
	getThumbBoundsFn: function(index){
		var bounds = $("img[data-index='" + index + "']").closest(".imageBackground")[0].getBoundingClientRect();
		return {x: bounds.left, y: bounds.top + $(window).scrollTop(), w: bounds.width};
	}
};

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

function shuffleImages() {
	var imgIndex = 0;
	var clonedData = photoswipeData.slice(0);
	$.each(shuffle(galleryLayout.items), function(index, value) {
		var img = $(value.element).find("img");
		var i = img.data("index");
		if(typeof i != "undefined") {
			img.data("index", imgIndex);
			img.attr("data-index", imgIndex);
			photoswipeData[imgIndex] = clonedData[i];
			imgIndex++;
		}
	});
	galleryLayout.layout();
}

function imageReady(img) {
	$(img).css("display", "block");
	$(img).addClass("fadeIn");
	$(img).prev().addClass("animated fadeOut");
	$(img).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
		$(this).removeClass("animated fadeIn");
		$(this).prev().remove();
	});
}

function openPhotoSwipe(targetIndex) {
	targetIndex = (typeof targetIndex === 'undefined') ? 0 : targetIndex;
	photoswipeOptions.index = targetIndex;
	photoswipeOptions.history = (window.innerWidth < 768);
	gallery = new PhotoSwipe(document.querySelector(".pswp"), PhotoSwipeUI_Default, photoswipeData, photoswipeOptions);
	gallery.init();
	gallery.listen("close", function() {
		if(window.innerWidth > 767) {
			var index = gallery.getCurrentIndex();
			var el = $("img[data-index='" + index + "']").closest(".imageBackground");
			var viewport = {top: $(window).scrollTop(), bottom: $(window).scrollTop() + window.innerHeight};
			var bounds = el.offset();
			bounds.bottom = bounds.top + el.outerHeight();
			bounds.top -= 70;
			if(viewport.top > bounds.top || viewport.bottom < bounds.bottom) {
				$(window).scrollTop(bounds.top);
			}
		}
	});
}

function loadMore() {
	if(next && $(window).scrollTop() + $(window).height() >= $(document).height() - 70) {
		retrieving.appendTo("#DAGallery");
		getDeviantArtFeed(next);
		next = null;
	}
}

function getDeviantArtFeed(queryURL) {
	$.ajax({
		type: "GET",
		url: queryURL,
		dataType: "xml",
		success: function(response) {
			var newCards = [];
			var xmlDocument = response;
			var entries = xmlDocument.querySelectorAll("item");
			retrieving.remove();
			$.each(entries, function(index, value) {
				if(value.querySelectorAll("content").length != 0) {
					var dataCategory = value.querySelector("category");
					dataCategory = dataCategory.hasAttribute("label") ? dataCategory.getAttribute("label") : "";
					var dataTitle = value.querySelector("title").childNodes[0].nodeValue;
					dataTitle = dataTitle.replace(/\b[A-Za-z]/, function(letter){return letter.toUpperCase();});
					var dataAuthor = value.querySelector("credit").childNodes[0].nodeValue;
					var dataLink = value.querySelector("guid").childNodes[0].nodeValue;
					var docText = value.querySelector("text");
					var dataURL = value.querySelector("content").getAttribute("url");
					var dataMedium = value.querySelector("content").getAttribute("medium");
					var imgIndex = photoswipeData.length;
					var imgWidth = parseInt(value.querySelector("content").getAttribute("width")) || 1;
					var imgHeight = parseInt(value.querySelector("content").getAttribute("height")) || 1;

					var columnWidth = 1;
					if(imgWidth / imgHeight > 1.9 || dataMedium == "document") {
						columnWidth = 2;
					}
					var pre = '<div class="cardWrapper col-md-3 col-sm-' + (4 * columnWidth) + ' col-xs-' + (6 * columnWidth) + '"><div class="card" data-link="' + dataLink + '">';
					var post = '<div class="info"><div class="artworkTitle">' + dataTitle + '</div><div class="artworkAuthor">' + dataAuthor + '</div></div></div></div>';
					switch(dataMedium) {
						case("document"):
							var card = $(pre + '<div style="position: relative; width: 100%; background: #222222;"><a href="' + dataLink + '" target="_blank" class="docText">' + docText.childNodes[0].nodeValue + '</a></div>' + post);
							break;
						case("image"):
						default:
							var card = $(pre + '<div class="imageBackground" style="padding-bottom: ' + imgHeight / imgWidth * 100 + '%;"><span class="loading">Loading...</span><img src="' + dataURL + '" class="animated" data-index="' + imgIndex + '" style="position: absolute; display: none; height: 100%; width: 100%;" onload="imageReady(this)"></div>' + post);

							// Add item to photoswipeData
							photoswipeData.push({title: '<a href="' + dataLink + '" target="_blank" class="caption"><div class="title">' + dataTitle + '</div><div>' + dataAuthor + '<br>Click to view on DeviantArt.com</div></a>', src: dataURL, w: imgWidth, h: imgHeight});
							break;
					}
					newCards.push(card[0]);
				}
			});
			$("#text").html("DeviantArt: My Favorites");
			$("#DAGallery").append(newCards);
			galleryLayout.appended(newCards);
			$(newCards).find(".card").on("click", function(e) {
				if($(this).find("img").length != 0) {
					openPhotoSwipe($(this).find("img").data("index"));
				}
			});
			next = null;
			$.each(xmlDocument.querySelectorAll("link"), function(index, value) {
				if(value.getAttribute("rel") == "next") {
					next = value.getAttribute("href");
				}
			});
			if(next == null) {
				$(window).off("scroll", loadMore);
			}
		},
		error: function() {
			$("#text").html("Could not retrieve feed.");
		}
	});
}

$(function() {
	galleryLayout = new Packery("#DAGallery", {"itemSelector": ".cardWrapper", "gutter": 0, "transitionDuration": "0.75s"});
	getDeviantArtFeed(baseURL);

	$(window).on("scroll", loadMore);
});
