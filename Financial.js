var exchangeRates = [];
var oneWeek = 604800000;

var toConversions = {
	USD: function(value) {
		return value * exchangeRates[0];
	},
	EUR: function(value) {
		return value * exchangeRates[1];
	},
	GBP: function(value) {
		return value * exchangeRates[2];
	},
	AUD: function(value) {
		return value * exchangeRates[3];
	},
	CAD: function(value) {
		return value * exchangeRates[4];
	},
	ypercent: function(value) {
		return value;
	},
	mpercent: function(value) {
		return value * 12;
	},
	ytimes: function(value) {
		return value;
	},
	mtimes: function(value) {
		return value * 12;
	},
	years: function(value) {
		return value;
	},
	months: function(value) {
		return value / 12;
	},
	days: function(value) {
		return value / 4380;
	}
};

var fromConversions = {
	USD: function(value) {
		return value / exchangeRates[0];
	},
	EUR: function(value) {
		return value / exchangeRates[1];
	},
	GBP: function(value) {
		return value / exchangeRates[2];
	},
	AUD: function(value) {
		return value / exchangeRates[3];
	},
	CAD: function(value) {
		return value / exchangeRates[4];
	},
	ypercent: function(value) {
		return value;
	},
	mpercent: function(value) {
		return value / 12;
	},
	ytimes: function(value) {
		return value;
	},
	mtimes: function(value) {
		return value / 12;
	},
	years: function(value) {
		return value;
	},
	months: function(value) {
		return value * 12;
	},
	days: function(value) {
		return value * 4380;
	}
};

function toggleCIEquation(element) { // Toggle compound interest/continuous interest
	if($("#toggleCC").hasClass("active")) {
		katex.render("\\displaystyle {A = P\\left( 1 + \\frac{r}{n}\\right)^{n\\times t}}", $("#CIEquation")[0]);
		$("#n").parent().removeClass("hidden");
		$("#toggleCC span").removeClass("fa-check");
		$("#toggleCC span").addClass("fa-times");
	}
	else {
		katex.render("\\displaystyle {A = P e^{r\\times t}}", $("#CIEquation")[0]);
		$("#n").val("");
		$("#n").parent().addClass("hidden");
		$("#toggleCC span").addClass("fa-check");
		$("#toggleCC span").removeClass("fa-times");
	}
}

function clearValues() { // Reset inputs
	$("#Ticker").val("");
	$("#tickerOutput").html("");
	docCookies.removeItem("ticker");
}

function displayStocks(stockData) { // Output stock data to table
	var color = "";
	if(stockData.LastTradePriceOnly && stockData.LastTradePriceOnly != 0 && $("#" + stockData.Symbol).length <= 0) { // Null value handling
		var priceChange = (stockData.ChangeRealtime ? stockData.ChangeRealtime : (stockData.Change ? stockData.Change : "0.00"));
		if(parseFloat(priceChange) < 0){color = "red";}
		else if(parseFloat(priceChange) > 0){color = "green";}
		else {color = "black";}
		$("#tickerOutput").append('<tr id="' + stockData.Symbol + '"><td data-toggle="tooltip" data-placement="top" title="Remove" onclick="removeTicker(this);" style="cursor: pointer;"><i class="fa fa-fw fa-times"></i></td><td>' + stockData.Symbol + '</td><td>' + stockData.LastTradePriceOnly + '</td><td style="color: ' + color + ';">' + priceChange + ' / ' + (stockData.PercentChange ? stockData.PercentChange : "0.00") + '</td></tr>');
		$('[data-toggle="tooltip"]').tooltip({"container": "body"});
	}
	else if(stockData.LastTradePriceOnly === 0) {
		swal({
			title: "Error!",
			text: stockData.Symbol + " is either private or does not exist.",
			type: "error",
			confirmButtonClass: "btn-danger",
			confirmButtonText: "OK"
		});
	}
}

function searchTicker(ticker) { // Ticker lookup
	if(ticker) {
		$(".alert").alert("close");
		$("#searchTicker").button("searching").addClass("disabled");
		$("#clearTicker").addClass("disabled");
		var data = {};
		ticker = encodeURIComponent(ticker.toUpperCase());
		$.getJSON("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22" + ticker + "%22)%0A%09%09&format=json&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=", function(json) { // Query Yahoo Finance for stock data
			if(json.query.results !== null) {
				if($.isArray(json.query.results.quote)) {
					$.each(json.query.results.quote, function(index, value) {
						displayStocks(value);
					});
				}
				else {
					displayStocks(json.query.results.quote);
				}
				var tickers = "";
				var sort = [];
				$("#tickerOutput tr").each(function(i, v) { // Sort stocks alphebetically
					sort.push($(v).attr("id"));
					tickers += ", " + $(v).attr("id");
				});
				sort.sort();
				for(var i = 0; i < $("#tickerOutput tr").length; i++) {
					var v = $("#tickerOutput tr:nth-child(" + (i + 1) + ")");
					if(sort[i] != v.attr("id")) {
						$("#" + sort[i]).insertBefore(v);
					}
				}
				tickers = tickers.slice(2);
				docCookies.setItem("ticker", tickers, Date.now() + oneWeek); // Set cookie with current data in table
			}
		})
		.always(function() {
			$("#searchTicker").button("reset").removeClass("disabled");
			$("#clearTicker").removeClass("disabled");
		});
	}
}

function removeTicker(r) { // Remove ticker from table
	$(r).tooltip("destroy");
	$(r).parent().remove();
	var tickers = "";
	$("#tickerOutput tr").each(function(i, v) {
		tickers += ", " + $(v).attr("id");
	});
	tickers = tickers.slice(2);
	docCookies.setItem("ticker", tickers, Infinity); // Update cookie
}

$(document).ready(function() {
	if(docCookies.getItem("ticker")) {
		searchTicker(docCookies.getItem("ticker")); // Load stored tickers
	}

	$.getJSON("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Ffinance.yahoo.com%2Fwebservice%2Fv1%2Fsymbols%2Fallcurrencies%2Fquote%3Fformat%3Djson%22&format=json&callback=", function(json) { // Get exchange rates
		$.each(json.query.results.list.resources, function(index, value) {
			exchangeRates[0] = 1;
			switch(value.resource.fields.name) {
				case "USD/EUR":
					$("#EURrate").html((1 / value.resource.fields.price).toFixed(4));
					exchangeRates[1] = parseFloat(value.resource.fields.price);
					break;
				case "USD/GBP":
					$("#GBPrate").html((1 / value.resource.fields.price).toFixed(4));
					exchangeRates[2] = parseFloat(value.resource.fields.price);
					break;
				case "USD/AUD":
					$("#AUDrate").html((1 / value.resource.fields.price).toFixed(4));
					exchangeRates[3] = parseFloat(value.resource.fields.price);
					break;
				case "USD/CAD":
					$("#CADrate").html((1 / value.resource.fields.price).toFixed(4));
					exchangeRates[4] = parseFloat(value.resource.fields.price);
					break;
			}
		});
	});

	$("#Ticker").keypress(function(e) {
		if(e.which == 13) {
			$("#searchTicker").click();
		}
	});

	$("#CICalculate").click(function() {
		$(".alert").alert("close");
		var validInputs = 0;
		var solveFor = "";
		$.each($("#CI #inputs div:not(.hidden)  input"), function(index, value) { // Get valid inputs
			if($(value).val()) {
				validInputs++;
			}
			else {
				solveFor = $(value);
			}
		});
		var A = toConversions[$("#Aunits").val()]($("#A").val());
		var P = toConversions[$("#Punits").val()]($("#P").val());
		var r = toConversions[$("#runits").val()]($("#r").val());
		var n = toConversions[$("#nunits").val()]($("#n").val());
		var t = toConversions[$("#tunits").val()]($("#t").val());
		if($("#toggleCC").hasClass("active") && validInputs == 3) {
			switch(solveFor.attr("id")) {
				case "P":
					solveFor.val(fromConversions[$("#Punits").val()](A / Math.pow(Math.E, r * t)));
					break;
				case "A":
					solveFor.val(fromConversions[$("#Aunits").val()](P * Math.pow(Math.E, r * t)));
					break;
				case "r":
					solveFor.val(fromConversions[$("#runits").val()](Math.log(A / P) / t));
					break;
				case "t":
					solveFor.val(fromConversions[$("#tunits").val()](Math.log(A / P) / r));
					break;
			}
		}
		else if(!$("#toggleCC").hasClass("active") && validInputs == 4) {
			switch(solveFor.attr("id")) {
				case "P":
					solveFor.val(fromConversions[$("#Punits").val()](A / Math.pow((1 + r / n), n * t)));
					break;
				case "A":
					solveFor.val(fromConversions[$("#Aunits").val()](P * Math.pow((1 + r / n), n * t)));
					break;
				case "r":
					solveFor.val(fromConversions[$("#runits").val()](n * Math.pow(A / P, 1 / (n * t)) - n));
					break;
				case "n":
					swal({
						title: "Error!",
						text: "It's not possible to solve for n in this equation.",
						type: "error",
						confirmButtonClass: "btn-danger",
						confirmButtonText: "OK"
					});
					break;
				case "t":
					solveFor.val(fromConversions[$("#tunits").val()]((Math.log(A / P) / Math.log(1 + r / n)) / n));
					break;
			}
		}
		else {
			if(($("#toggleCC").hasClass("active") && validInputs <= 2) || (!$("#toggleCC").hasClass("active") && validInputs <= 3)) {errorMessage = "Too many unknowns.";}
			else {errorMessage = "Leave only one value blank.";}
			swal({
				title: "Error!",
				text: errorMessage,
				type: "error",
				confirmButtonClass: "btn-danger",
				confirmButtonText: "OK"
			});
		}
	});

	$("#CIClear").click(function() {
		$("#P").val("");
		$("#A").val("");
		$("#r").val("");
		$("#n").val("");
		$("#t").val("");
	});
});