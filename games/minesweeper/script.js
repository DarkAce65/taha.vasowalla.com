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
		if(timer.value === 999) {
			clearInterval(timer.id);
		}
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
		minefield[row][col].state = "open";
		var value = minefield[row][col].value;
		var cell = $(".cell[data-row=" + row + "][data-col=" + col + "]");
		if(value < 0) {
			cell.removeClass("closed");
			cell.addClass("redmine");
			endGame();
		}
		else {
			if(openedCells + totalMines === boardRows * boardCols) {
				winGame();
			}
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

	function addScore(name) {
		var difficulty = $("#controls input:radio:checked").val();
		if(difficulty !== "custom") {
			if(docCookies.hasItem(difficulty)) {
				var scores = $.parseJSON(docCookies.getItem(difficulty));
				scores.push({name: name, time: timer.value});
				docCookies.setItem(difficulty, JSON.stringify(scores));
				$("#highscores tbody").append("<tr><td>" + name + "</td><td>" + timer.value + "</td></tr>");
			}
			else {
				var scores = [{name: name, time: timer.value}];
				docCookies.setItem(difficulty, JSON.stringify(scores));
				$("#highscores tbody").append("<tr><td>" + name + "</td><td>" + timer.value + "</td></tr>");
			}
		}
	}

	function getScores(difficulty) {
		if(difficulty !== "custom") {
			$("#highscores tbody").html("");
			if(docCookies.hasItem(difficulty)) {
				var scores = $.parseJSON(docCookies.getItem(difficulty));
				for(var i = 0; i < scores.length; i++) {
					$("#highscores tbody").append("<tr><td>" + scores[i].name + "</td><td>" + scores[i].time + "</td></tr>");
				}
			}
		}
	}

	function winGame() {
		$(".cell").off("click contextmenu");
		$("#face").addClass("win");
		clearInterval(timer.id);
		if($("#controls input:radio:checked").val() !== custom) {
			swal({
				title: "You Win!",
				text: "Enter your name for highscores",
				type: "input",
				placeholder: "Name",
				showCancelButton: true
			},
			function(name) {
				if(name === false) {
					return false;
				}
				else if(name === "") {
					swal.showInputError("Please enter your name.");
					return false;
				}

				addScore(name);
			});
		}
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
		boardRows = Math.max(9, Math.min(24, rows));
		boardCols = Math.max(9, Math.min(30, cols));
		totalMines = Math.max(10, Math.min((boardRows - 1) * (boardCols - 1), numMines));
		clearInterval(timer.id);
		timer.value = -1;
		openedCells = 0;
		minesLeft = totalMines;
		for(var r = 0; r < boardRows; r++) {
			minefield[r] = [];
			for(var c = 0; c < boardCols; c++) {
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
			switch(minefield[r][c].state) {
				case "closed":
					openCell(r, c);
					break;
				case "open":
					chord(r, c);
					break;
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
						$(e.target).removeClass("closed");
						$(e.target).addClass("flag");
						minesLeft--;
						break;
					case "flag":
						minefield[r][c].state = "closed";
						$(e.target).removeClass("flag");
						$(e.target).addClass("closed");
						minesLeft++;
						break;
				}
				$("#minesLeft").html(numToDisplay(minesLeft));
			}
		});
	}

	var minefield, boardRows = 16, boardCols = 30, totalMines = 99;
	var timer = {id: 0, value: 0}, openedCells, minesLeft;
	var numbers = [];
	for(var i = 0; i < 10; i++) {
		numbers[i] = '<i class="number n' + i + '"></i>';
	}
	numbers[10] = '<i class="number dash"></i>';
	buildMinefield(boardRows, boardCols, totalMines);
	getScores("expert");

	$("#face").click(function(e) {
		buildMinefield(boardRows, boardCols, totalMines);
	});

	$("#controls input:radio").on("change", function(e) {
		switch($("#controls input:radio:checked").val()) {
			case "beginner":
				$("#highscores").show();
				getScores("beginner");
				boardRows = 9;
				boardCols = 9;
				totalMines = 10;
				buildMinefield(boardRows, boardCols, totalMines);
				break;
			case "intermediate":
				$("#highscores").show();
				getScores("intermediate");
				boardRows = 16;
				boardCols = 16;
				totalMines = 40;
				buildMinefield(boardRows, boardCols, totalMines);
				break;
			case "expert":
				$("#highscores").show();
				getScores("expert");
				boardRows = 16;
				boardCols = 30;
				totalMines = 99;
				buildMinefield(boardRows, boardCols, totalMines);
				break;
			case "custom":
				$("#highscores").hide();
				break;
		}
	});

	$("#customSize").submit(function(e) {
		e.preventDefault();
		var rows = parseInt($("#customSize #rows").val(), 10);
		$("#customSize #rows").val("");
		rows = isNaN(rows) ? 0 : rows;
		var cols = parseInt($("#customSize #cols").val(), 10);
		$("#customSize #cols").val("");
		cols = isNaN(cols) ? 0 : cols;
		var mines = parseInt($("#customSize #mines").val(), 10);
		$("#customSize #mines").val("");
		mines = isNaN(mines) ? 0 : mines;

		$("#customDialog").modal("hide");

		buildMinefield(rows, cols, mines);
	});

	var shift = false;
	var cc = 0;
	var code = [120, 121, 122, 122, 121, 13];
	$(document).on("keyup keydown", function(e) {shift = e.shiftKey});
	$(document).on("keypress", function(e) {
		if(e.which === code[cc]) {
			cc++;
			if(cc === code.length && shift) {
				$("body").append('<i id="secret"></i>');
				$("#board").on("mouseenter", ".cell", function(e) {
					var r = $(e.target).data("row");
					var c = $(e.target).data("col");
					var color = minefield[r][c].value < 0 ? "black" : "white";
					$("#secret").css("background-color", color);
				});
				$(document).off("keyup keypress keydown");
			}
		}
		else {
			cc = 0;
		}
	});
});