"use strict";

$(function() {
	function openCell(row, col)  {
		if(minefield[row][col].state === "closed") {
			minefield[row][col].state = "open";
			var value = minefield[row][col].value;
			var cell = $(".cell[data-row=" + row + "][data-col=" + col + "]");
			if(value < 0) {
				cell.removeClass("closed");
				cell.addClass("mine");
			}
			else {
				if(value === 0) {
					var rowStart = Math.max(0, row - 1);
					var rowEnd = Math.min(minefield.length - 1, row + 1);
					var colStart = Math.max(0, col - 1);
					var colEnd = Math.min(minefield[0].length - 1, col + 1);
					for(var r = rowStart; r <= rowEnd; r++) {
						for(var c = colStart; c <= colEnd; c++) {
							openCell(r, c);
						}
					}
				}
				cell.removeClass("closed");
				cell.addClass("open" + value);
			}
		}
	}

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
			updateNeighbors(l.r, l.c);
		}
	}

	function updateNeighbors(row, col)  {
		var rowStart = Math.max(0, row - 1);
		var rowEnd = Math.min(minefield.length - 1, row + 1);
		var colStart = Math.max(0, col - 1);
		var colEnd = Math.min(minefield[0].length - 1, col + 1);
		for(var r = rowStart; r <= rowEnd; r++) {
			for(var c = colStart; c <= colEnd; c++) {
				minefield[r][c].value += 1;
			}
		}
	}

	function buildMinefield(rows, cols, numMines) {
		minefield = [];
		for(var r = 0; r < rows; r++) {
			minefield[r] = [];
			for(var c = 0; c < cols; c++) {
				minefield[r][c] = {
					value: 0, // 0 to 8, negative = mine
					state: "closed" // open, closed, flag
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
				board += '<td data-row="' + r + '" data-col="' + c + '" class="cell closed"></td>';
			}
			board += "</tr>";
		}
		$("#board").html(board);

		$(".cell").click(function(e) {
			var r = $(e.target).data("row");
			var c = $(e.target).data("col");
			openCell(r, c);
		});

		$(".cell").contextmenu(function(e) {
			e.preventDefault();
			var r = $(e.target).data("row");
			var c = $(e.target).data("col");
			switch(minefield[r][c].state) {
				case "closed":
					minefield[r][c].state = "flag";
					$(e.target).addClass("flag");
					break;
				case "flag":
					minefield[r][c].state = "closed";
					$(e.target).removeClass("flag");
					break;
			}
		});
	}

	var minefield;
	buildMinefield(7, 7, 10);
});