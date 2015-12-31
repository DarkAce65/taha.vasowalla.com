var before = new Date();
before.setHours(before.getHours() - 2);
Accounts.removeOldGuests(before);

AccountsGuest.anonymous = true;

Meteor.startup(function() {
	Meteor.call("removeInactiveLobbies");
});

Meteor.setInterval(function() {
	Meteor.call("removeInactiveLobbies");
}, 3333);

Meteor.publish("lobbies", function() {
	return Lobbies.find({}, {
		"fields": {
			"password": 0
		}
	});
});

Meteor.publish("userPresence", function() {
	return Presences.find({userId: {$in: Lobbies.findOne({members: this.userId}).members}});
});