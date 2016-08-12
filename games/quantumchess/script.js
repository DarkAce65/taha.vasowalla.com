var resizeTimeout, board, primary, secondary, state, turn, piecesKnown, locked; // state: primary, secondary, unknown

var PRIMARY = "p";
var SECONDARY = "s";
var UNKNOWN = "?";

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

function highlightSquare(square) {
	var squareEl = $("#board .square-" + square);

	var background = "#a9a9a9";
	if (squareEl.hasClass("black-3c85d")) {
		background = "#696969";
	}

	squareEl.css("backgroundColor", background);
}

function removeHighlights() {
	$("#board .square-55d63").css("backgroundColor", "");
}

function updateTurn() {
	locked = null;
	$(".highlight1-32417").removeClass("highlight1-32417");
	turn = (turn === "w" ? "b" : "w");
	primary.load(primary.fen().replace(/\s[wb]/, " " + turn));
	secondary.load(secondary.fen().replace(/\s[wb]/, " " + turn));

	if (turn === "w") {
		$("#turn").addClass("red");
		$("#turn").removeClass("black");
		$("#turn").html("Red's");
	}
	else {
		$("#turn").addClass("black");
		$("#turn").removeClass("red");
		$("#turn").html("Black's");
	}
}

function endTurn(source, target) {
	if (primary.square_color(target) === "light" || primary.get(target).type === "k") {
		state[target] = state[source];
	}
	else if (primary.square_color(target) === "dark") {
		state[target] = UNKNOWN;
	}

	piecesKnown[target] = piecesKnown[source];
	delete piecesKnown[source];
	if (source !== target) {
		delete state[source];
	}

	if (primary.fen().indexOf("k") === -1) {
		gameOver("White");
	}
	if (primary.fen().indexOf("K") === -1) {
		gameOver("Black");
	}

	updateTurn();
	displayBoard();
}

function gameOver(winner) {
	sweetAlert({
		title: winner + " wins!"
	});
}

function checkPromotion(source) {
	return primary.get(source).type === "p" && (
		(source.substring(1) === "8" && turn === "w") ||
		(source.substring(1) === "1" && turn === "b")
	);
}

function promotePiece(source, target) {
	var color = turn;
	var promotionOptions = "";
	promotionOptions += '<div id="buttons" class="btn-group">';
	for(var i = 0; i < 4; i++) {
		var letter = "bnrq".split("")[i];
		promotionOptions += '<button data-piecetype="' + letter + '" class="btn btn-default">';
		promotionOptions += '<img src="chessboardjs/img/chesspieces/' + color + letter.toUpperCase() + '.png">';
		promotionOptions += '</button>';
	}
	promotionOptions += '</div>';

	sweetAlert({
		title: "Which piece would you like to promote this pawn to?",
		text: promotionOptions,
		html: true,
		showConfirmButton: false,
		allowEscapeKey: false
	});

	$("#buttons button").one("click", function() {
		var letter = $(this).data("piecetype");

		primary.remove(source);
		primary.put({
			type: letter,
			color: color
		}, target);
		secondary.put(secondary.remove(source), target);

		sweetAlert.close();
		endTurn(source, target);
	})
}

function displayBoard() {
	var primaryObj = ChessBoard.fenToObj(primary.fen());
	var secondaryObj = ChessBoard.fenToObj(secondary.fen());
	var mainObj = {};
	for (var square in state) {
		switch (state[square]) {
			case PRIMARY:
				mainObj[square] = primaryObj[square];
				break;
			case SECONDARY:
				mainObj[square] = secondaryObj[square];
				break;
			case UNKNOWN:
				mainObj[square] = primaryObj[square].substring(0,1) + "?"; //w? or b?
				break;
		}
	}

	for (var square in piecesKnown) {
		if (!piecesKnown[square]) {
			secondaryObj[square] = secondaryObj[square].substring(0,1) + "?";
		}
	}

	board.quantumPosition(mainObj, primaryObj, secondaryObj);
	$(".square-" + locked).addClass("highlight1-32417");
}

$(function() {
	var onDragStart = function(source, piece, position, orientation) {
		if ((turn === "w" && piece.search(/^w/) === -1) || (turn === "b" && piece.search(/^b/) === -1)) {
			return false;
		}

		if (locked !== null && locked !== source) {
			return false;
		}
		locked = source;

		var initiallyUnknown = false;
		if (state[source] === UNKNOWN) {
			initiallyUnknown = true;
			state[source] = (Math.random() < 0.5 ? PRIMARY : SECONDARY);
		}

		var moves, game;
		if (state[source] === PRIMARY) {
			game = primary;
		}
		else if (state[source] === SECONDARY) {
			game = secondary;
			piecesKnown[source] = true;
		}
		moves = game.moves({
			"square": source,
			"verbose": true,
			"legal": false
		});

		displayBoard();

		if (moves.length === 0 && initiallyUnknown) { // Piece is unknown and has the potential to be a piece with moves
			if (state[source] === PRIMARY && checkPromotion(source)) {
				promotePiece(source, source);
			}
			updateTurn();
			return false;
		}
		if (moves.length === 0) { // Piece is known to not be able to move
			locked = null;
			$(".highlight1-32417").removeClass("highlight1-32417");
			return false;
		}

		highlightSquare(source);
		for (var i = 0; i < moves.length; i++) {
			highlightSquare(moves[i].to);
		}
	};

	var onDragEnd = function(source, target) {
		removeHighlights();

		// Find all moves from square
		var moves;
		var game;
		if (state[source] === PRIMARY) {
			game = primary;
		}
		else if (state[source] === SECONDARY) {
			game = secondary;
		}
		moves = game.moves({
			"square": source,
			"verbose": true,
			"legal": false
		});

		// Promote if pawn is active at end
		if (source === target && checkPromotion(source)) {
			promotePiece(source, target);
			return;
		}

		var valid = false;
		for (var i = 0; i < moves.length; i++) {
			if (moves[i].to === target) { // Make sure move is to target
				valid = true;
				if (moves[i].flags.indexOf("p") !== -1) { // Check for promotion
					promotePiece(source, target);
				}
				else { // Valid move, not promotion
					primary.put(primary.remove(source), target);
					secondary.put(secondary.remove(source), target);
					endTurn(source, target);
				}
				break;
			}
		}


		if (!valid) { // Move not to target; still locked
			return "snapback";
		}
	};

	var onSnapbackEnd = function() {
		displayBoard();
	};

	var secondaryArrayString = shuffleArray("rnbqbnrpppppppp".split("")).join("");
	var secondaryInitialFen = secondaryArrayString.substring(0, 4) + "k" + secondaryArrayString.substring(4, 7) + "/" + secondaryArrayString.substring(7);
	secondaryInitialFen += "/8/8/8/8/";
	secondaryArrayString = shuffleArray("PPPPPPPPRNBQBNR".split("")).join("");
	secondaryInitialFen += secondaryArrayString.substring(0, 8) + "/" + secondaryArrayString.substring(8, 12) + "K" + secondaryArrayString.substring(12);
	secondaryInitialFen += " w - - 0 1";

	primary = new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1");
	secondary = new Chess(secondaryInitialFen);
	state = ChessBoard.fenToObj(primary.fen());
	piecesKnown = ChessBoard.fenToObj(primary.fen());
	for (var square in state) {
		if (state[square].substring(1, 2) === "K") {
			state[square] = PRIMARY;
			piecesKnown[square] = true;
		}
		else {
			state[square] = UNKNOWN;
			piecesKnown[square] = false;
		}
	}

	turn = "w";
	locked = null;

	var config = {
		"quantum": true,
		"draggable": true,
		"showNotation": false,
		"pieceTheme": "chessboardjs/img/chesspieces/{piece}.png",
		"onDragStart": onDragStart,
		"onDrop": onDragEnd,
		"onSnapbackEnd": onSnapbackEnd
	};
	board = ChessBoard("board", config); // Initialize chessboard
	displayBoard();

	$(window).resize(function() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function() {
			board.resize();
		}, 500);
	});
});