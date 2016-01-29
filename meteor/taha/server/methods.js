Meteor.methods({
	"heartbeat": function() {
		Meteor.users.update(this.userId, {$set: {"heartbeat": Date.now()}});
	},
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
			"numMembers": 1,
			"maxPlayers": 0
		};
		if(game === "mafia") {
			lobby.maxPlayers = 16;
		}
		else if(game === "uttt") {
			lobby.maxPlayers = 2;
		}
		if(password.trim()) {
			lobby.private = true;
			lobby.password = password.trim();
		}
		var lobbyId = Lobbies.insert(lobby);
		Meteor.users.update(this.userId, {$set: {"currentRoomId": lobbyId}});
		return lobbyId;
	},
	"joinLobby": function(lobbyId, password) {
		var lobby = Lobbies.findOne(lobbyId);
		if(!lobby) {
			throw new Meteor.Error("lobby-not-found", "The lobby was not found.");
		}
		if(lobby.members.length >= lobby.maxPlayers) {
			throw new Meteor.Error("lobby-full", "The lobby is full.");
		}
		if(lobby.private && lobby.password !== password) {
			throw new Meteor.Error("incorrect-password", "The password was incorrect.");
		}
		Lobbies.update(lobbyId, {$push: {members: this.userId}});
		Meteor.users.update(this.userId, {$set: {"currentRoomId": lobbyId}});
	},
	"leaveLobby": function(lobbyId) {
		if(!Lobbies.findOne(lobbyId)) {
			throw new Meteor.Error("lobby-not-found", "The lobby was not found.");
		}
		Lobbies.update(lobbyId, {$pull: {members: this.userId}});
		Lobbies.remove({"members": {$size: 0}});
		Meteor.users.update(this.userId, {$set: {"currentRoomId": false}});
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
	"removeInactiveLobbies": function() {
		var activeUsers = Meteor.users.find().fetch();
		var now = Date.now();
		for(var i = 0; i < activeUsers.length; i++) {
			if(now - activeUsers[i].heartbeat < 10000) {
				activeUsers[i] = activeUsers[i]._id;
			}
			else {
				activeUsers.splice(i, 1);
				i--;
			}
		}
		Lobbies.update({}, {$pull: {"members": {$nin: activeUsers}}}, {"multi": true});
		Lobbies.remove({"members": {$size: 0}});
	}
});