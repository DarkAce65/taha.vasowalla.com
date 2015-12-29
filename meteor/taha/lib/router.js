Router.configure({
	notFoundTemplate: "404"
});

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
	template: "UltimateTTT",
	onBeforeAction: function() {
		$("body").addClass("light-theme");
		this.next();
	},
	onStop: function() {
		$("body").removeClass("light-theme");
	}
});

Router.route("Mafia", {
	name: "mafia",
	template: "mafia",
	onBeforeAction: function() {
		$("body").addClass("light-theme");
		this.next();
	},
	waitOn: function() {
		return Meteor.subscribe("lobbies");
	},
	onStop: function() {
		$("body").removeClass("light-theme");
	}
});

Router.route("/Mafia/lobby/:_id", {
	name: "mafiaLobby",
	template: "mafiaLobby",
	waitOn: function() {
		return Meteor.subscribe("lobbies");
	},
	data: function() {
		return Lobbies.findOne(this.params._id);
	}
});