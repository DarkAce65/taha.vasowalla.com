var id = [], titles = [], url = [], alt = [], transcript = [];
var txtData = [];

function sort(data) {
	for(var i = 0; i < data.length; i = i + 5) {
		var index = Math.round(i / 5);
		id[index] = data[i];
		titles[index] = data[i + 1];
		url[index] = data[i + 2];
		alt[index] = data[i + 3];
		transcript[index] = data[i + 4];
	}

	$("#search").button("reset");
	$("#searchInput").keypress(function(e) {
		if(e.which == 13) {
			$("#search").click();
			$("#search").focus();
		}
	});
}

function search() {
	$("#output").html("");
	var query = $("#searchInput").val().toLowerCase();
	var i = parseInt(query, 10) - 1;

	if(typeof i == "number" && i !== NaN && i < id.length) {
		$("#error").addClass("hidden");
		var comic = $('<div class="comic"><h3 class="title">' + titles[i] + '<span class="subtitle">Comic ' + id[i] + '</span></h3><div class="image"><img src="" data-src="http://' + url[i] + '" title=' + alt[i] + '></div></div><br>');
		$("#output").append(comic);
		comic.find("img").unveil(0, function() {
			$(this).on("load", function() {
				this.style.opacity = 1;
			});
		});
	}
	else if(query.length < 3) {
		$("#error").removeClass("hidden");
	}

	if(query.length >= 3) {
		$("#error").addClass("hidden");
		var found = false;
		for(var i = 0; i < id.length; i++) {
			found = false;
			if(titles[i] != null) {
				if(titles[i].toLowerCase().indexOf(query) != -1) {
					found = true;
				}
			}
			if(transcript[i] != null) {
				if(transcript[i].toLowerCase().indexOf(query) != -1) {
					found = true;
				}
			}
			if(found) {
				var comic = $('<div class="comic"><h3 class="title">' + titles[i] + '<span class="subtitle">Comic ' + id[i] + '</span></h3><div class="image"><img src="" data-src="http://' + url[i] + '" title=' + alt[i] + '></div></div><br>');
				$("#output").append(comic);
				comic.find("img").unveil(0, function() {
					$(this).on("load", function() {
						this.style.opacity = 1;
					});
				});
			}
		}
		if($("#output").html() == "") {
			$("#output").append('<div class="comic col-xs-12 col-sm-6 col-sm-offset-3"><h3 class="title">No results found.</h3></div>');
		}
	}
}

$(function() {
	$("#search").button("loading");
	$.get("xkcdData.txt", function(response) {
		txtData = response.split("\n");
		sort(txtData);
	});
});