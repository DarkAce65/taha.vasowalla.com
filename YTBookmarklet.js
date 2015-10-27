javascript:(function() {
	if(!window.youtubeBG) {
		window.youtubeBG = function() {
			if(yt.getConfig("VIDEO_ID") !== null) {
				var styleTag = document.createElement("style");
				styleTag.setAttribute("class", "youtubeBG");
				document.getElementsByTagName("head")[0].appendChild(styleTag);
				var cssSheet = styleTag.sheet ? styleTag.sheet : styleTag.styleSheet;
				cssSheet.insertRule('.yt-card:before{visibility: visible;
					content: "";
					width: 100%;
					height: 100%;
					top: 0;
					left: 0;
					position: absolute;
					opacity: 0.55;
					pointer-events: none;
					transition: 0.25s;}', 0);
				cssSheet.insertRule(".yt-card:hover:before{opacity: 0;}", 0);
				cssSheet.insertRule(".yt-card{position: relative;}", 0);
				cssSheet.insertRule(".view-count, .g-hovercard, .stat{color: #333;}", 0);
				cssSheet.insertRule(".yt-ui-ellipsis{background: transparent;}", 0);
				var hq = 'url("https://i.ytimg.com/vi/' + yt.getConfig("VIDEO_ID") + '/hqdefault.jpg") no-repeat fixed 50% 50% / cover transparent';
				var maxres = 'url("https://i.ytimg.com/vi/' + yt.getConfig("VIDEO_ID") + '/maxresdefault.jpg") no-repeat fixed 50% 50% / cover transparent';
				var img = new Image();
				img.src = 'https://i.ytimg.com/vi/' + yt.getConfig("VIDEO_ID") + '/maxresdefault.jpg';
				img.onload = function() {
					if(img.width + "x" + img.height == "120x90") {
						cssSheet.insertRule("#page{background: " + hq + "}", 0);
						cssSheet.insertRule(".yt-card:before{background: " + hq + "}", 0);
					}
					else {
						cssSheet.insertRule("#page{background: " + maxres + "}", 0);
						cssSheet.insertRule(".yt-card:before{background: " + maxres + "}", 0);
					}
					if(document.querySelector(".youtubeBG") && document.querySelector(".youtubeBG") != styleTag) {
						document.querySelector(".youtubeBG").remove();
					}
				};
			}
		};
		window.youtubeBGDelay = function() {
			setTimeout(window.youtubeBG, 3000);
		}
		var video = document.querySelector(".html5-main-video");
		if(video) {
			video.addEventListener("playing", window.youtubeBG);
			video.addEventListener("playing", window.youtubeBGDelay);
		}
		window.youtubeBG();
	}
	else {
		var styleTag = document.querySelector(".youtubeBG");
		if(styleTag) {
			styleTag.remove();
		}
		var video = document.querySelector(".html5-main-video");
		if(video) {
			video.removeEventListener("playing", window.youtubeBG);
			video.removeEventListener("playing", window.youtubeBGDelay);
		}
		window.youtubeBG = undefined;
	}
}());