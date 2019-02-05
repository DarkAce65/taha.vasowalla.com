"use strict";

var s, bg, bgScale, fgScale, masked, mask;

function update() {
	var time = new Date();
	var percent = (time.getHours() * 60 + time.getMinutes()) / 1440;
	bg.attr({fill: bgScale(percent)});
	masked.attr({fill: fgScale(percent)});
	$("#time").html(to12Hour(time));
	$("#date").html(time.toDateString());
}

function weatherLocation(position) {
	$.ajax({
		type: "POST",
		url: "getWeather.php",
		data: {position: position},
		complete: function(response) {
			var weatherData = $.parseJSON(response.responseText);
			$("#title").html("Weather in " + weatherData.name);
			$("#date").html(new Date(weatherData.dt * 1000).toDateString());
			$("#temp").html(((weatherData.main.temp - 273.15) * 9 / 5 + 32).toFixed(2) + "&#176;F");
			$("#weatherIcon").html('<img src="https://openweathermap.org/img/w/' + weatherData.weather[0].icon + '.png" style="width: 5em;">');
			$("#weatherDesc").html(toTitleCase(weatherData.weather[0].description));
			$("#humidity").html('<span style="color: #888;">Humidity:</span> <b>' + Math.round(weatherData.main.humidity) + '%</b>');
			$("#wind").html('<span style="color: #888;">Wind:</span> <b><i class="fa fa-long-arrow-up" style="margin: 0 5px;"></i>' + (weatherData.wind.speed * 2.2369362920544).toFixed(2) + ' mph</b>');
			$("#wind i").css("transform", "rotate(" + weatherData.wind.deg + "deg)");
			$("#sun").html('<p><span style="color: #888;">Sunrise:</span> <b>' + to12Hour(weatherData.sys.sunrise * 1000) + '</b> || <span style="color: #888;">Sunset:</span> <b>' + to12Hour(weatherData.sys.sunset * 1000) + '</b></p>');
			var sunriseP = (new Date(weatherData.sys.sunrise * 1000).getHours() * 60 + new Date(weatherData.sys.sunrise * 1000).getMinutes()) / 1440;
			var sunsetP = (new Date(weatherData.sys.sunset * 1000).getHours() * 60 + new Date(weatherData.sys.sunset * 1000).getMinutes()) / 1440;
			var stops = [0, sunriseP - 0.05, sunriseP, sunriseP + 0.05, 0.5, sunsetP - 0.05, sunsetP, sunsetP + 0.05, 1];
			bgScale = chroma.scale(["#00041D", "#00041D", "#242766", "#018594", "#018594", "#018594", "#F47E6A", "#00041D", "#00041D"], stops);
			fgScale = chroma.scale(["#00BECE", "#00BECE", "#D26C56", "#FFD4AD", "#FFD4AD", "#FFD4AD", "#FCB57F", "#00BECE", "#00BECE"], stops);
			$("#solar .fluid-container").removeClass("hidden");
			update();
		},
		error: function() {
			console.error("error");
		}
	});
}

function error_callback(e) {
	switch(e.code) {
		case e.PERMISSION_DENIED:
			$("#title").html("Geolocation is turned off.");
			break;
		case e.POSITION_UNAVAILABLE:
			$("#title").html("Location information is unavailable.");
			break;
		case e.TIMEOUT:
			$("#title").html("The request to get user location timed out.");
			break;
		case e.UNKNOWN_ERROR:
			$("#title").html("An unknown error occurred.");
			break;
	}
}

function to12Hour(time) {
	time = new Date(time);
	var timeString = "";
	if(time.getHours() > 12)
		timeString = time.getHours() - 12;
	else if(time.getHours() == 0)
		timeString = "12";
	else
		timeString = time.getHours();
	if(time.getMinutes() > 9)
		timeString = timeString + ":" + time.getMinutes();
	else
		timeString = timeString + ":0" + time.getMinutes();
	if(time.getHours() < 12)
		timeString = timeString + " am";
	else
		timeString = timeString + " pm";
	return timeString;
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

$(function() {
	bgScale = chroma.scale(["#00041D", "#00041D", "#242766", "#018594", "#018594", "#018594", "#F47E6A", "#00041D", "#00041D"], [0, .2, .25, .3, .5, .78, .83, .88, 1]);
	fgScale = chroma.scale(["#00BECE", "#00BECE", "#D26C56", "#FFD4AD", "#FFD4AD", "#FFD4AD", "#FCB57F", "#00BECE", "#00BECE"], [0, .2, .25, .3, .5, .78, .83, .88, 1]);
	var ypercent = 0;
	s = Snap("#clock");
	bg = s.rect(0, 0, "100%", "100%").attr({fill: bgScale(ypercent)});
	masked = s.rect(0, 0, "100%", "100%").attr({fill: fgScale(ypercent)});
	mask = s.circle("50%", "100%", "100%");
	mask.attr({
		fill: "r()#fff-#000"
	});
	masked.attr({
		mask: mask
	});
	$("#clock").height($(window).height() - 50);

	if(geoPosition.init()) {
		$("#title").html("Retrieving weather for your location...");
		geoPosition.getCurrentPosition(weatherLocation, error_callback, {enableHighAccuracy: true});
	}
	else {
		$("#title").html("Geolocation is not available for this device.");
	}

	$(window).on("resize", function() {
		$("#clock").height($(window).height() - 50);
		update();
	});

	update();
	setInterval(update, 10000);
});