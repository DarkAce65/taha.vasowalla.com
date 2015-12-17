Router.configure({
	layoutTemplate: "main",
	notFoundTemplate: "404"
});

Router.route("/", function() {
	this.response.writeHead(302, {
		"Location": "http://taha.vasowalla.com/"
	});
	this.response.end();
}, {where: "server"});