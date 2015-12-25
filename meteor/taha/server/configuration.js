var before = new Date();
before.setHours(before.getHours() - 2);
Accounts.removeOldGuests(before);

AccountsGuest.anonymous = true;

Meteor.publish("lobbies", function() {
	return Lobbies.find();
});