Meteor.methods({
	"createLobby": function(lobbyName, password) {
		if(lobbyName.trim() === "") {
			throw new Meteor.Error("invalid-lobby-name", "Invalid lobby name.");
		}
		var lobby = {"owner": this.userId, "name": lobbyName, "members": [this.userId], "private": false};
		if(password) {
			lobby.private = true;
			lobby.password = password;
		}
		Lobbies.insert(lobby);
	},
	"joinLobby": function(lobbyId) {
		if(!Lobbies.findOne(lobbyId)) {
			throw new Meteor.Error("lobby-not-found", "The lobby was not found.");
		}
		if(Lobbies.findOne(lobbyId).members.length >= 16) {
			throw new Meteor.Error("lobby-full", "The lobby is full.");
		}
		Lobbies.update(lobbyId, {$push: {members: this.userId}});
	},
	"leaveLobby": function(lobbyId) {
		if(!Lobbies.findOne(lobbyId)) {
			throw new Meteor.Error("lobby-not-found", "The lobby was not found.");
		}
		Lobbies.update(lobbyId, {$pull: {members: this.userId}});

		if(Lobbies.findOne(lobbyId).members.length === 0) {
			Lobbies.remove(lobbyId);
		}
		else {
			var members = Lobbies.findOne(lobbyId).members;
			var onlineMembers = false;
			var presences = Presences.find().fetch();
			for(var i = 0; i < presences.length; i++) {
				if(members.indexOf(presences[i].userId) !== -1) {
					onlineMembers = true;
				}
			}
			if(!onlineMembers) {
				Lobbies.remove(lobbyId);
			}
		}
	},
	"deleteLobby": function(lobbyId) {
		if(!Lobbies.findOne(lobbyId)) {
			throw new Meteor.Error("lobby-not-found", "The lobby was not found.");
		}
		if(this.userId !== Lobbies.findOne(lobbyId).owner) {
			throw new Meteor.Error("invalid-permissions", "You do not have permission to delete this lobby.");
		}
		Lobbies.remove(lobbyId);
	}
});