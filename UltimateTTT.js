var turn = true; // true: Red, false: Blue
var grid = [
	[
		[["", "", ""], ["", "", ""], ["", "", ""]], // 0, 0
		[["", "", ""], ["", "", ""], ["", "", ""]], // 0, 1
		[["", "", ""], ["", "", ""], ["", "", ""]]  // 0, 2
	],
	[
		[["", "", ""], ["", "", ""], ["", "", ""]], // 1, 0
		[["", "", ""], ["", "", ""], ["", "", ""]], // 1, 1
		[["", "", ""], ["", "", ""], ["", "", ""]]  // 1, 2
	],
	[
		[["", "", ""], ["", "", ""], ["", "", ""]], // 2, 0
		[["", "", ""], ["", "", ""], ["", "", ""]], // 2, 1
		[["", "", ""], ["", "", ""], ["", "", ""]]  // 2, 2
	]
];

function reset() {
	turn = true;
	grid = [[[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]], [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]] ], [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]]];
	$("#TTT-winner").html("");
	$("#TTT-turnText").css("display", "block");
	$("#TTT-button").css("display", "none");
	$(".Red").removeClass("Red");
	$(".Blue").removeClass("Blue");
	$("table table td").addClass("possible");
	$("#turn").html("Red");
	$("#turn").css("color", "red");
}

function tie() {
	var result = true;
	for(var row = 0; row < 3; row++) {
		for(var col = 0; col < 3; col++) {
			if($.isArray(grid[row][col])) {
				result = false;
			}
		}
	}
	return result;
}

function winner() {
	var result = false;
	for(var i = 0; i < 3; i++) {
		result = result || JSON.stringify(grid[i]) === JSON.stringify(["Red","Red","Red"]);
		result = result || JSON.stringify(grid[i]) === JSON.stringify(["Blue","Blue","Blue"]);

		result = result || JSON.stringify([grid[0][i], grid[1][i], grid[2][i]]) === JSON.stringify(["Red", "Red", "Red"]);
		result = result || JSON.stringify([grid[0][i], grid[1][i], grid[2][i]]) === JSON.stringify(["Blue", "Blue", "Blue"]);
	}
	result = result || JSON.stringify([grid[0][0], grid[1][1], grid[2][2]]) === JSON.stringify(["Red", "Red", "Red"]);
	result = result || JSON.stringify([grid[0][0], grid[1][1], grid[2][2]]) === JSON.stringify(["Blue", "Blue", "Blue"]);

	result = result || JSON.stringify([grid[0][2], grid[1][1], grid[2][0]]) === JSON.stringify(["Red", "Red", "Red"]);
	result = result || JSON.stringify([grid[0][2], grid[1][1], grid[2][0]]) === JSON.stringify(["Blue", "Blue", "Blue"]);
	return result;
}

function winSquare(row, col) {
	var result = false;
	for(var i = 0; i < 3; i++) {
		result = result || JSON.stringify(grid[row][col][i]) === JSON.stringify(["Red","Red","Red"]);
		result = result || JSON.stringify(grid[row][col][i]) === JSON.stringify(["Blue","Blue","Blue"]);

		result = result || JSON.stringify([grid[row][col][0][i], grid[row][col][1][i], grid[row][col][2][i]]) === JSON.stringify(["Red", "Red", "Red"]);
		result = result || JSON.stringify([grid[row][col][0][i], grid[row][col][1][i], grid[row][col][2][i]]) === JSON.stringify(["Blue", "Blue", "Blue"]);
	}
	result = result || JSON.stringify([grid[row][col][0][0], grid[row][col][1][1], grid[row][col][2][2]]) === JSON.stringify(["Red", "Red", "Red"]);
	result = result || JSON.stringify([grid[row][col][0][0], grid[row][col][1][1], grid[row][col][2][2]]) === JSON.stringify(["Blue", "Blue", "Blue"]);

	result = result || JSON.stringify([grid[row][col][0][2], grid[row][col][1][1], grid[row][col][2][0]]) === JSON.stringify(["Red", "Red", "Red"]);
	result = result || JSON.stringify([grid[row][col][0][2], grid[row][col][1][1], grid[row][col][2][0]]) === JSON.stringify(["Blue", "Blue", "Blue"]);
	return result;
}

$(document).ready(function() {
	var innerhtml = "";
	for(var row = 0; row < 3; row++) {
		innerhtml += "<tr>"
		for(var col = 0; col < 3; col++) {
			innerhtml += "<td><table data-row=\"" + row + "\" data-column=\"" + col + "\">";
			for(var i = 0; i < 3; i++) {
				innerhtml += "<tr>";
				for(var j = 0; j < 3; j++) {
					innerhtml += "<td data-row=\"" + i + "\" data-column=\"" + j + "\"></td>";
				}
				innerhtml += "</tr>";
			}
			innerhtml += "</table></td>";
		}
		innerhtml += "</tr>"
	}

	$("#ultimate").html(innerhtml);
	$("table table td").addClass("possible");

	$("table table td").click(function() {
		if($(this).hasClass("possible")) {
			var row = Number($($(this).parents("table:not(#ultimate)")[0]).data("row"));
			var col = Number($($(this).parents("table:not(#ultimate)")[0]).data("column"));
			var i = Number($(this).data("row"));
			var j = Number($(this).data("column"));
			grid[row][col][i][j] = turn ? "Red" : "Blue";
			$(".possible").removeClass("possible");
			$(this).addClass(grid[row][col][i][j]);

			if(winSquare(row, col)) {
				grid[row][col] = turn ? "Red" : "Blue";
				$("table table[data-row=" + row + "][data-column=" + col + "]").addClass(turn ? "Red" : "Blue");
			}
			if($.isArray(grid[row][col])) {
				if(grid[row][col][0].indexOf("") === -1 &&
					grid[row][col][1].indexOf("") === -1 &&
					grid[row][col][2].indexOf("") === -1) {

					grid[row][col] = "";
				}
			}

			if(winner()) {
				$("#TTT-winner").html((turn ? "Red" : "Blue") + " won! Congrats!");
				$("#TTT-turnText").css("display", "none");
				$("#TTT-button").css("display", "inline-block");
				swal({
					title: "Game over!",
					text: (turn ? "Red" : "Blue") + " won! Congrats!",
					type: "success",
					confirmButtonClass: "btn-success",
					confirmButtonText: "OK"
				});
			}
			else if(tie()) {
				$("#TTT-winner").html("The match ended with a tie!");
				$("#TTT-turnText").css("display", "none");
				$("#TTT-button").css("display", "inline-block");
				swal({
					title: "Game over!",
					text: "There was a tie!",
					type: "info",
					confirmButtonClass: "btn-success",
					confirmButtonText: "OK"
				});
			}
			else {
				if($.isArray(grid[i][j])) {
					$("table table[data-row=" + i + "][data-column=" + j + "] td:not(.Red, .Blue)").addClass("possible");
				}
				else {
					$("table table:not(.Red, .Blue) td:not(.Red, .Blue)").addClass("possible");
				}
				$("#turn").html(turn ? "Blue" : "Red");
				$("#turn").css("color", turn ? "blue" : "red");
			}
			turn = !turn;
		}
	});
});