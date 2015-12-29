Router.configure({
	notFoundTemplate: "404"
});

Router.onBeforeAction("dataNotFound");

Router.onBeforeAction(function() {
	$("body").addClass("light-theme");
	this.next();
}, {except: ["home", "404"]});

Router.route("/",
	function() {
		this.response.writeHead(302, {
			"Location": "http://taha.vasowalla.com/"
		});
		this.response.end();
	},
	{
		name: "home",
		where: "server"
	}
);

Router.route("UltimateTTT", {
	name: "UTTT",
	template: "UltimateTTT"
});

Router.route("Mafia", {
	name: "mafia",
	template: "mafia",
	waitOn: function() {
		return Meteor.subscribe("lobbies");
	},
	action: function() {
		Meteor.users.update(Meteor.userId(), {$set: {"profile.currentRoomId": false}});
		this.render();
	}
});

Router.route("/Mafia/lobby/:_id", {
	name: "mafiaLobby",
	template: "mafiaLobby",
	waitOn: function() {
		return [Meteor.subscribe("userPresence"), Meteor.subscribe("lobbies")];
	},
	data: function() {
		return Lobbies.findOne(this.params._id);
	},
	action: function() {
		Meteor.users.update(Meteor.userId(), {$set: {"profile.currentRoomId": this.params._id}});
		this.render();
	}
});