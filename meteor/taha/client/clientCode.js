/* Subscriptions */

Meteor.subscribe("userPresence");
Meteor.subscribe("lobbies");

/* Templates */

Template.registerHelper("equals", function(v1, v2) {
	return v1 === v2;
});

Template.registerHelper("existsIn", function(el, array) {
	if($.isArray(array)) {
		return array.indexOf(el) !== -1;
	}
	return false;
});

Template.registerHelper("isArray", function(a) {
	return $.isArray(a);
});

Template.UltimateTTT.onCreated(function() {
	var turn = true; // true: Red, false: Blue
	var grid = [];
	var bigGrid = [];
	for(var i = 0; i < 3; i++) {
		grid[i] = new Array(3);
		bigGrid[i] = new Array(3);
		for(var j = 0; j < 3; j++) {
			grid[i][j] = new Array(3);
			bigGrid[i][j] = "";
			for(var k = 0; k < 3; k++) {
				grid[i][j][k] = new Array(3);
				for(var l = 0; l < 3; l++) {
					grid[i][j][k][l] = "possible";
				}
			}
		}
	}

	this.turn = new ReactiveVar(turn);
	this.grid = new ReactiveVar(grid);
	this.bigGrid = new ReactiveVar(bigGrid);
});

Template.UltimateTTT.helpers({
	"grid": function() {
		return Template.instance().grid.get();
	},
	"bigSquare": function(row, col) {
		return Template.instance().bigGrid.get()[row][col];
	}
});



function reset() {
	var grid = [];
	var bigGrid = [];
	for(var i = 0; i < 3; i++) {
		grid[i] = new Array(3);
		bigGrid[i] = new Array(3);
		for(var j = 0; j < 3; j++) {
			grid[i][j] = new Array(3);
			bigGrid[i][j] = "";
			for(var k = 0; k < 3; k++) {
				grid[i][j][k] = new Array(3);
				for(var l = 0; l < 3; l++) {
					grid[i][j][k][l] = "possible";
				}
			}
		}
	}
	Template.instance().turn.set(true);
	Template.instance().grid.set(grid);
	Template.instance().bigGrid.set(bigGrid);
	$("#TTT-winner").html("");
	$("#TTT-turnText").css("display", "block");
	$("#TTT-button").css("display", "none");
	$("#turn").html("Red");
	$("#turn").css("color", "red");
}

function tie(grid) {
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

function winner(grid) {
	var result = false;
	for(var i = 0; i < 3; i++) {
		result = result || JSON.stringify(grid[i]) === JSON.stringify(["Red", "Red", "Red"]);
		result = result || JSON.stringify(grid[i]) === JSON.stringify(["Blue", "Blue", "Blue"]);

		result = result || JSON.stringify([grid[0][i], grid[1][i], grid[2][i]]) === JSON.stringify(["Red", "Red", "Red"]);
		result = result || JSON.stringify([grid[0][i], grid[1][i], grid[2][i]]) === JSON.stringify(["Blue", "Blue", "Blue"]);
	}
	result = result || JSON.stringify([grid[0][0], grid[1][1], grid[2][2]]) === JSON.stringify(["Red", "Red", "Red"]);
	result = result || JSON.stringify([grid[0][0], grid[1][1], grid[2][2]]) === JSON.stringify(["Blue", "Blue", "Blue"]);

	result = result || JSON.stringify([grid[0][2], grid[1][1], grid[2][0]]) === JSON.stringify(["Red", "Red", "Red"]);
	result = result || JSON.stringify([grid[0][2], grid[1][1], grid[2][0]]) === JSON.stringify(["Blue", "Blue", "Blue"]);
	return result;
}

function winSquare(grid, row, col) {
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

Template.UltimateTTT.events({
	"click table table td": function(e) {
		var el = $(e.target);
		if(el.hasClass("possible")) {
			var row = Number($(el.parents("table:not(#ultimate)")[0]).data("row"));
			var col = Number($(el.parents("table:not(#ultimate)")[0]).data("column"));
			var i = Number(el.data("row"));
			var j = Number(el.data("column"));
			var grid = Template.instance().grid.get();
			var bigGrid = Template.instance().bigGrid.get();
			console.log(row, col, i, j);
			grid[row][col][i][j] = turn ? "Red" : "Blue";
			for(var a = 0; a < 3; a++) {
				for(var b = 0; b < 3; b++) {
					for(var c = 0; c < 3; c++) {
						for(var d = 0; d < 3; d++) {
							if(grid[a][b][c][d] === "possible") {
								grid[a][b][c][d] = "";
							}
						}
					}
				}
			}

			if(winSquare(grid, row, col)) { // Move won a square
				bigGrid[row][col] = turn ? "Red" : "Blue";
			}
			if($.isArray(grid[row][col])) { // Tied square
				if(grid[row][col][0].indexOf("") === -1 &&
					grid[row][col][1].indexOf("") === -1 &&
					grid[row][col][2].indexOf("") === -1) {
					bigGrid[row][col] = turn ? "Red" : "Blue";
				}
			}

			if(winner(grid)) { // Game winner
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
			else if(tie(grid)) { // Game tied
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
			else { // If square is available, make it possible. If not, make everything possible
				if(bigGrid[i][j] === "") {
					for(var a = 0; a < 3; a++) {
						for(var b = 0; b < 3; b++) {
							if(grid[i][j][a][b] === "") {
								grid[i][j][a][b] = "possible";
							}
						}
					}
				}
				else {
					$("table table:not(.Red, .Blue) td:not(.Red, .Blue)").addClass("possible");
				}
				$("#turn").html(turn ? "Blue" : "Red");
				$("#turn").css("color", turn ? "blue" : "red");
			}
			turn = !turn;
			Template.instance().grid.set(grid);
			Template.instance().bigGrid.set(bigGrid);
		}
	}
});

Template.mafia.onCreated(function() {
	this.creatingLobby = false;
});

Template.mafia.helpers({
	"lobbies": function() {
		return Lobbies.find();
	},
	"userId": function() {
		return Meteor.userId();
	},
	"username": function() {
		if(Meteor.user() && Meteor.user().profile.name) {
			return Meteor.user().profile.name;
		}
		return false;
	},
	"menuHeader": function() {
		if(Meteor.user() && Meteor.user().profile.name) {
			return Meteor.user().profile.name;
		}
		return "Menu";
	}
});

Template.mafia.events({
	"click #newLobby": function(e) {
		Template.instance().creatingLobby = true;
		if(Meteor.user().profile.name) {
			$("#newLobbyModal").modal("show");
		}
		else {
			$("#usernameModal").modal("show");
		}
	},
	"click #changeUsername": function(e) {
		Template.instance().creatingLobby = false;
	},
	"click .joinLobby": function(e) {
		var lobbyId = $(e.target).closest(".lobby").data("id");
		if($(e.target).data("private")) {
			Meteor.call("joinLobby", lobbyId, input);
		}
		else {
			Meteor.call("joinLobby", lobbyId);
		}
	},
	"click .leaveLobby": function(e) {
		Meteor.call("leaveLobby", $(e.target).closest(".lobby").data("id"));
	},
	"click .deleteLobby": function(e) {
		Meteor.call("deleteLobby", $(e.target).closest(".lobby").data("id"));
	},
	"submit #createLobby": function(e) {
		e.preventDefault();
		var lobbyName = $(e.target).find("#lobbyName").val();
		var password = $(e.target).find("#password").val();
		Meteor.call("createLobby", lobbyName, password);
		$("#newLobbyModal").modal("hide");
	},
	"submit #setUsername": function(e) {
		e.preventDefault();
		Meteor.users.update(Meteor.userId(), {$set: {"profile.name": $(e.target).find("#username").val()}});
		$("#usernameModal").modal("hide");
		if(Template.instance().creatingLobby) {
			$("#newLobbyModal").modal("show");
		}
	}
});