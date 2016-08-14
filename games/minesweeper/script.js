"use strict";

$(function() {
	function addMines(numMines) {
		var mineLocations = [];
		for(var i = 0; i < numMines; i++) { // Reservoir sampling
			mineLocations[i] = {r: ~~(i / minefield[0].length), c: i % minefield[0].length};
		}
		for(var i = numMines; i < minefield.length * minefield[0].length; i++) {
			var j = ~~(Math.random() * i)
			if(j < numMines) {
				mineLocations[j] = {r: ~~(i / minefield[0].length), c: i % minefield[0].length};
			}
		}

		for(var i = 0; i < mineLocations.length; i++) {
			var l = mineLocations[i];
			minefield[l.r][l.c].value = -9;
		}
	}

	function buildMinefield(rows, cols, numMines) {
		minefield = [];
		for(var r = 0; r < rows; r++) {
			minefield[r] = [];
			for(var c = 0; c < cols; c++) {
				minefield[r][c] = {
					value: 0, // 0 to 8, negative = mine
					state: "none" // flag,
				};
			}
		}

		addMines(numMines);
		minefieldToDOM(minefield);
	}

	function minefieldToDOM(minefield) {
		var board = "";
		for(var r = 0; r < minefield.length; r++) {
			board += "<tr>";
			for(var c = 0; c < minefield[r].length; c++) {
				var l = minefield[r][c].value < 0 ? "mine" : "";
				board += '<td class="cell ' + l + '"></td>';
			}
			board += "</tr>";
		}
		$("#board").html(board);
	}

	var minefield;
	buildMinefield(7, 7, 10);
});