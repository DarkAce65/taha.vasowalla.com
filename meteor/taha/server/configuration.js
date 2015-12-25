AccountsGuest.anonymous = true;

Meteor.publish("lobbies", function() {
	return Lobbies.find();
});