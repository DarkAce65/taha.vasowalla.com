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

Router.route("UltimateTTT",
	function() {
		this.layout("main");
	},
	{
		name: "UTTT",
		template: "UltimateTTT",
		onBeforeAction: function() {
			$("body").addClass("class");
			this.next();
		},
		onStop: function() {
			$("body").removeClass("class");
		}
	}
);