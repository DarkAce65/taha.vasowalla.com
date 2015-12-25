Meteor.methods({
	"createLobby": function(lobbyName, password) {
		if(lobbyName.trim() === "") {
			throw new Meteor.Error("invalid-lobby-name", "Invalid lobby name.");
		}
		var lobby = {name: lobbyName, private: false};
		if(password) {
			lobby.private = true;
			lobby.password = password;
		}
		Lobbies.insert(lobby);
	}
});