Meteor.methods({
	"createLobby": function(owner, lobbyName, password) {
		if(lobbyName.trim() === "") {
			throw new Meteor.Error("invalid-lobby-name", "Invalid lobby name.");
		}
		var lobby = {"owner": owner, "name": lobbyName, "members": 0, "private": false};
		if(password) {
			lobby.private = true;
			lobby.password = password;
		}
		Lobbies.insert(lobby);
	}
});