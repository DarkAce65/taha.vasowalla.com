Meteor.publish("lobbies", function() {
	return Lobbies.find();
});