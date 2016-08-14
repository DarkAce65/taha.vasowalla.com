"use strict";

$(function() {
	function buildMinefield(rows, cols, mines) {
		minefield = [];
		for(var r = 0; r < rows; r++) {
			minefield[r] = [];
			for(var c = 0; c < cols; c++) {
				var mine = (Math.random() > 0.5);
				minefield[r][c] = {
					value: -1, // -1 to 8, -1 = mine
					state: "none" // flag, 
				};
			}
		}
		minefieldToDOM(minefield);
	}

	function minefieldToDOM(minefield) {
		var board = "";
		var a = ["mine", "redmine", "flag", "mark", "open0", "open1", "open2", "open3", "open4", "open5", "open6", "open7", "open8"];
		for(var r = 0; r < minefield.length; r++) {
			board += "<tr>";
			for(var c = 0; c < minefield[r].length; c++) {
				board += '<td class="cell ' + a[(r+c) % a.length] + '"></td>';
			}
			board += "</tr>";
		}
		$("#board").html(board);
	}

	var minefield;
	buildMinefield(8, 15, 10);
});