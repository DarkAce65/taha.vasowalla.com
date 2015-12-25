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
	"deleteLobby": function(lobbyId) {
		if(!Lobbies.findOne(lobbyId)) {
			throw new Meteor.Error("lobby-not-found", "The specified id didn't match a lobby.");
		}
		if(this.userId !== Lobbies.findOne(lobbyId).owner) {
			throw new Meteor.Error("invalid-permissions", "You do not have permission to delete this lobby.");
		}
		Lobbies.remove({_id: lobbyId});
	}
});