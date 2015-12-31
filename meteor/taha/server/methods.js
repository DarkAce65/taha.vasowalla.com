Meteor.methods({
	"createLobby": function(lobbyName, password, game) {
		if(lobbyName.trim() === "") {
			throw new Meteor.Error("invalid-lobby-name", "Invalid lobby name.");
		}
		var lobby = {
			"owner": this.userId,
			"name": lobbyName,
			"members": [this.userId],
			"private": false,
			"game": game,
			"maxPlayers": 0
		};
		if(game === "mafia") {
			lobby.maxPlayers = 16;
		}
		else if(game === "uttt") {
			lobby.maxPlayers = 2;
		}
		if(password) {
			lobby.private = true;
			lobby.password = password;
		}
		return Lobbies.insert(lobby);
	},
	"joinLobby": function(lobbyId, password) {
		var Lobby = Lobbies.findOne(lobbyId);
		if(!Lobby) {
			throw new Meteor.Error("lobby-not-found", "The lobby was not found.");
		}
		if(Lobby.members.length >= lobby.maxPlayers) {
			throw new Meteor.Error("lobby-full", "The lobby is full.");
		}
		if(Lobby.private && Lobby.password !== password) {
			throw new Meteor.Error("incorrect-password", "The password was incorrect.");
		}
		Lobbies.update(lobbyId, {$push: {members: this.userId}});
	},
	"leaveLobby": function(lobbyId) {
		if(!Lobbies.findOne(lobbyId)) {
			throw new Meteor.Error("lobby-not-found", "The lobby was not found.");
		}
		Lobbies.update(lobbyId, {$pull: {members: this.userId}});
		Meteor.call("removeInactiveLobbies", lobbyId);
	},
	"deleteLobby": function(lobbyId) {
		if(!Lobbies.findOne(lobbyId)) {
			throw new Meteor.Error("lobby-not-found", "The lobby was not found.");
		}
		if(this.userId !== Lobbies.findOne(lobbyId).owner) {
			throw new Meteor.Error("invalid-permissions", "You do not have permission to delete this lobby.");
		}
		Lobbies.remove(lobbyId);
	},
	"removeInactiveLobbies": function(lobbyId) {
		var lobbyFilter = {};
		if(lobbyId) {
			lobbyFilter = lobbyId;
		}
		var presences = Presences.find().fetch();
		for(var i = 0; i < presences.length; i++) {
			presences[i] = presences[i].userId;
		}
		Lobbies.update(lobbyFilter, {$pull: {"members": {$nin: presences}}}, {"multi": true});
		Lobbies.remove({"members": {$size: 0}});
	}
});