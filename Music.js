var selectors = {play: ".play", pause: ".pause", stop: ".stop", mute: ".mute", unmute: ".unmute", currentTime: ".currentTime", duration: ".duration", seekBar: ".seekbar", playBar: ".playbar"};
$(document).ready(function() {
	$("#Overdrive").jPlayer({ // Initialize jPlayer with options
		ready: function() {
			$(this).jPlayer("setMedia", {
				mp3: "audio/Overdrive.mp3"
			});
			$(this).jPlayer("volume", 1);
		},
		play: function() {
			$(this).jPlayer("pauseOthers");
		},
		swfPath: "/jPlayer",
		supplied: "mp3",
		wmode: "window",
		cssSelectorAncestor: "#O-container",
		cssSelector: selectors
	});

	$("#PlatinumRain").jPlayer({
		ready: function() {
			$(this).jPlayer("setMedia", {
				mp3: "audio/Platinum_Rain.mp3"
			});
			$(this).jPlayer("volume", 1);
		},
		play: function() {
			$(this).jPlayer("pauseOthers");
		},
		swfPath: "/jPlayer",
		supplied: "mp3",
		wmode: "window",
		cssSelectorAncestor: "#PR-container",
		cssSelector: selectors
	});

	$("#Unstrung").jPlayer({
		ready: function() {
			$(this).jPlayer("setMedia", {
				mp3: "audio/Unstrung.mp3"
			});
			$(this).jPlayer("volume", 1);
		},
		play: function() {
			$(this).jPlayer("pauseOthers");
		},
		swfPath: "/jPlayer",
		supplied: "mp3",
		wmode: "window",
		cssSelectorAncestor: "#U-container",
		cssSelector: selectors
	});

	$("#Demons").jPlayer({
		ready: function() {
			$(this).jPlayer("setMedia", {
				mp3: "audio/Imagine_Dragons_Demons.mp3"
			});
			$(this).jPlayer("volume", 1);
		},
		play: function() {
			$(this).jPlayer("pauseOthers");
		},
		swfPath: "/jPlayer",
		supplied: "mp3",
		wmode: "window",
		cssSelectorAncestor: "#D-container",
		cssSelector: selectors
	});
});