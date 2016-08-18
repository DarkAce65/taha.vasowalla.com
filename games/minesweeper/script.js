"use strict";

$(function() {
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

	function numToDisplay(n) {
		var display = [];
		var dash = n < 0;
		n = Math.abs(n);
		for(var i = 0; i < 3; i++) {
			display[2 - i] = numbers[n % 10];
			n = ~~(n / 10);
		}
		if(dash) {
			display[0] = numbers[10];
		}

		return display.join("");
	}

	function updateTimer() {
		timer.value += 1;
		$("#timer").html(numToDisplay(timer.value));
	}

	function removeSurroundingBombs(row, col) {
		var minesRemoved = 0;
		var avoidLocations = [];
		var rowStart = Math.max(0, row - 1);
		var rowEnd = Math.min(boardRows - 1, row + 1);
		var colStart = Math.max(0, col - 1);
		var colEnd = Math.min(boardCols - 1, col + 1);
		for(var r = rowStart; r <= rowEnd; r++) {
			for(var c = colStart; c <= colEnd; c++) {
				avoidLocations.push({r: r, c: c});
				if(minefield[r][c].value < 0) {
					minefield[r][c].value += 9;
					modifyNeighbors(r, c, -1);
					minesRemoved++;
				}
			}
		}

		addMines(minesRemoved, avoidLocations);
	}

	function openNeighbors(row, col) {
		var rowStart = Math.max(0, row - 1);
		var rowEnd = Math.min(boardRows - 1, row + 1);
		var colStart = Math.max(0, col - 1);
		var colEnd = Math.min(boardCols - 1, col + 1);
		for(var r = rowStart; r <= rowEnd; r++) {
			for(var c = colStart; c <= colEnd; c++) {
				if(!(r === row && c === col) && minefield[r][c].state === "closed") {
					openCell(r, c);
				}
			}
		}
	}

	function openCell(row, col) {
		if(openedCells === 0) {
			removeSurroundingBombs(row, col);
			updateTimer();
			timer.id = setInterval(updateTimer, 1000);
		}
		openedCells += 1;
		if(openedCells + totalMines === boardRows * boardCols) {
			winGame();
		}
		minefield[row][col].state = "open";
		var value = minefield[row][col].value;
		var cell = $(".cell[data-row=" + row + "][data-col=" + col + "]");
		if(value < 0) {
			cell.removeClass("closed");
			cell.addClass("redmine");
			endGame();
		}
		else {
			if(value === 0) {
				openNeighbors(row, col);
			}
			cell.removeClass("closed");
			cell.addClass("open" + value);
		}
	}

	function surroundingMinesFlagged(row, col) {
		var rowStart = Math.max(0, row - 1);
		var rowEnd = Math.min(boardRows - 1, row + 1);
		var colStart = Math.max(0, col - 1);
		var colEnd = Math.min(boardCols - 1, col + 1);
		var flags = 0;
		for(var r = rowStart; r <= rowEnd; r++) {
			for(var c = colStart; c <= colEnd; c++) {
				if(minefield[r][c].state === "flag") {
					flags++;
				}
			}
		}

		return minefield[row][col].value === flags;
	}

	function chord(row, col) {
		if(minefield[row][col].state === "open" && surroundingMinesFlagged(row, col)) {
			openNeighbors(row, col);
		}
	}

	function winGame() {
		$(".cell").off("click contextmenu");
		$("#face").addClass("win");
		clearInterval(timer.id);
		for(var r = 0; r < boardRows; r++) {
			for(var c = 0; c < boardCols; c++) {
				var cell = $(".cell[data-row=" + r + "][data-col=" + c + "]");
				if(minefield[r][c].state === "closed" && minefield[r][c].value < 0) {
					minefield[r][c].state = "flag";
					cell.removeClass("closed");
					cell.addClass("flag");
				}
			}
		}
	}

	function endGame() {
		$(".cell").off("click contextmenu");
		$("#face").addClass("lose");
		clearInterval(timer.id);
		for(var r = 0; r < boardRows; r++) {
			for(var c = 0; c < boardCols; c++) {
				var cell = $(".cell[data-row=" + r + "][data-col=" + c + "]");
				if(minefield[r][c].state === "closed" && minefield[r][c].value < 0) {
					minefield[r][c].state = "open";
					cell.removeClass("closed");
					cell.addClass("mine");
				}
				else if(minefield[r][c].state === "flag" && minefield[r][c].value >= 0) {
					minefield[r][c].state = "open";
					cell.removeClass("flag");
					cell.addClass("xmine");
				}
			}
		}
	}

	function addMines(numMines, avoidLocations) {
		avoidLocations = (typeof avoidLocations === "undefined") ? [] : avoidLocations;
		var avoid = {};
		for(var i = 0; i < avoidLocations.length; i++) {
			var l = avoidLocations[i];
			if(avoid.hasOwnProperty("row" + l.r)) {
				avoid["row" + l.r].push(l.c);
			}
			else {
				avoid["row" + l.r] = [l.c];
			}
		}

		var possibleLocations = [];
		for(var r = 0; r < boardRows; r++) {
			for(var c = 0; c < boardCols; c++) {
				if(avoid.hasOwnProperty("row" + r) && avoid["row" + r].indexOf(c) !== -1) {
					continue;
				}
				if(minefield[r][c].value >= 0) {
					possibleLocations.push({r: r, c: c});
				}
			}
		}

		var mineLocations = shuffle(possibleLocations).slice(0, numMines);
		for(var i = 0; i < mineLocations.length; i++) {
			var l = mineLocations[i];
			minefield[l.r][l.c].value -= 9;
			modifyNeighbors(l.r, l.c, 1);
		}
	}

	function modifyNeighbors(row, col, delta) {
		var rowStart = Math.max(0, row - 1);
		var rowEnd = Math.min(boardRows - 1, row + 1);
		var colStart = Math.max(0, col - 1);
		var colEnd = Math.min(boardCols - 1, col + 1);
		for(var r = rowStart; r <= rowEnd; r++) {
			for(var c = colStart; c <= colEnd; c++) {
				if(r === row && c === col) {
					continue;
				}
				minefield[r][c].value += delta;
			}
		}
	}

	function buildMinefield(rows, cols, numMines) {
		minefield = [];
		boardRows = rows;
		boardCols = cols;
		totalMines = Math.min((rows - 1) * (cols - 1), numMines);
		clearInterval(timer.id);
		timer.value = -1;
		openedCells = 0;
		minesLeft = totalMines;
		for(var r = 0; r < rows; r++) {
			minefield[r] = [];
			for(var c = 0; c < cols; c++) {
				minefield[r][c] = {
					value: 0, // -9 to 8, negative = mine
					state: "closed" // open, closed, flag
				};
			}
		}

		addMines(totalMines);
		minefieldToDOM(minefield);
	}

	function minefieldToDOM(minefield) {
		var board = "";
		for(var r = 0; r < boardRows; r++) {
			board += "<tr>";
			for(var c = 0; c < boardCols; c++) {
				board += '<td data-row="' + r + '" data-col="' + c + '" class="cell closed"></td>';
			}
			board += "</tr>";
		}
		$("#minesLeft").html(numToDisplay(minesLeft));
		$("#face").removeClass("surprise win lose");
		$("#timer").html(numToDisplay(0));
		$("#board").html(board);

		$("#board").on("mousedown", function(e) {
			$("#face").addClass("surprise");
		});

		$("#board").on("mouseup mouseleave", function(e) {
			$("#face").removeClass("surprise");
		});

		$(".cell").click(function(e) {
			var r = $(e.target).data("row");
			var c = $(e.target).data("col");
			if(minefield[r][c].state === "closed") {
				openCell(r, c);
			}
		});

		$(".cell").contextmenu(function(e) {
			e.preventDefault();
			if(openedCells > 0) {
				var r = $(e.target).data("row");
				var c = $(e.target).data("col");
				switch(minefield[r][c].state) {
					case "closed":
						minefield[r][c].state = "flag";
						$(e.target).addClass("flag");
						minesLeft--;
						break;
					case "flag":
						minefield[r][c].state = "closed";
						$(e.target).removeClass("flag");
						minesLeft++;
						break;
					case "open":
						chord(r, c);
						break;
				}
				$("#minesLeft").html(numToDisplay(minesLeft));
			}
		});
	}

	var minefield, boardRows, boardCols, totalMines;
	var timer = {id: 0, value: 0}, openedCells, minesLeft;
	var numbers = [];
	for(var i = 0; i < 10; i++) {
		numbers[i] = '<i class="number n' + i + '"></i>';
	}
	numbers[10] = '<i class="number dash"></i>';
	buildMinefield(15, 30, 99); // 7x7 + 10, 15x15 + 40, 15x30 + 99

	$("#face").click(function(e) {
		buildMinefield(boardRows, boardCols, totalMines);
	});

	$("#controls input:radio").on("change", function(e) {
		switch($("#controls input:radio:checked").val()) {
			case "beginner":
				boardRows = 7;
				boardCols = 7;
				totalMines = 10;
				break;
			case "intermediate":
				boardRows = 15;
				boardCols = 15;
				totalMines = 40;
				break;
			case "expert":
				boardRows = 15;
				boardCols = 30;
				totalMines = 99;
				break;
			case "custom":
				boardRows = parseInt($("#controls #rows").val(), 10);
				boardCols = parseInt($("#controls #cols").val(), 10);
				totalMines = parseInt($("#controls #mines").val(), 10);
				break;
		}
	});
});