$(function() {
	var bounds = {top: 20, right: 60, bottom: 20, left: 60};
	var width = window.innerWidth - bounds.left - bounds.right;
	var height = window.innerHeight - bounds.top - bounds.bottom;

	var depthMultiplier = width / 4;
	var treemap;

	var svg = d3.select("body").append("svg")
		.attr("id", "tree");
	var boundary = svg.append("g").attr("transform", "translate(" + bounds.left + "," + bounds.top + ")");

	var sidebar = d3.select("body").append("div")
		.attr("id", "sidebar");

	resize();

	var root, i = 0, duration = 750;

	function update(source) {
		function diagonal(s, d) { // Creates a curved (diagonal) path from parent to the child nodes
			path = `M ${s.y} ${s.x}
			C ${(s.y + d.y) / 2} ${s.x},
			${(s.y + d.y) / 2} ${d.x},
			${d.y} ${d.x}`;

			return path;
		}

		function click(d) {
			if(d.children) {
				d._children = d.children;
				d.children = null;
			}
			else {
				d.children = d._children;
				d._children = null;
			}
			update(d);
		}

		var treeData = treemap(root);
		var nodes = treeData.descendants(), links = treeData.descendants().slice(1);
		nodes.forEach(function(d) {
			d.y = d.depth * depthMultiplier;
		});

		var node = boundary.selectAll("g.node")
			.data(nodes, function(d) {
				return d.id || (d.id = ++i);
			});

		// Enter any new modes at the parent's previous position.
		var nodeEnter = node.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(d) {
				return "translate(" + source.y0 + "," + source.x0 + ")";
			})
			.on("click", click)
			.classed("haschildren", function(d) {
				return d._children ? true : false;
			});

		// Add circle for the nodes
		nodeEnter.append("circle")
			.attr("r", 1e-6);

		// Add labels for the nodes
		nodeEnter.append("text")
			.attr("dy", ".35em")
			.attr("x", function(d) {
				return d.children || d._children ? -13 : 13;
			})
			.attr("text-anchor", function(d) {
				return d.children || d._children ? "end" : "start";
			})
			.text(function(d) {
				return d.data.name;
			});

		var nodeUpdate = nodeEnter.merge(node);
		// Transition to the proper position for the node
		nodeUpdate.transition()
			.duration(duration)
			.attr("transform", function(d) {
				return "translate(" + d.y + "," + d.x + ")";
			});

		// Update the node attributes and style
		nodeUpdate.classed("haschildren", function(d) {
			return d._children ? true : false;
		});
		nodeUpdate.select("circle").attr("r", 10);

		// Remove any exiting nodes
		var nodeExit = node.exit().transition()
			.duration(duration)
			.attr("transform", function(d) {
				return "translate(" + source.y + "," + source.x + ")";
			})
			.remove();

		nodeExit.select("circle").attr("r", 1e-6);
		nodeExit.select("text").style("fill-opacity", 1e-6);

		var link = boundary.selectAll("path.link")
			.data(links, function(d) {
				return d.id;
			});

		// Enter any new links at the parent's previous position.
		var linkEnter = link.enter().insert("path", "g")
			.attr("class", "link")
			.attr("d", function(d) {
				var o = {x: source.x0, y: source.y0};
				return diagonal(o, o);
			});

		var linkUpdate = linkEnter.merge(link);
		// Transition back to the parent element position
		linkUpdate.transition()
			.duration(duration)
			.attr("d", function(d) {
				return diagonal(d, d.parent);
			});

		// Remove any exiting links
		var linkExit = link.exit().transition()
			.duration(duration)
			.attr("d", function(d) {
				var o = {x: source.x, y: source.y};
				return diagonal(o, o);
			})
			.remove();

		// Store the old positions for transition.
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}

	d3.json("data.json", function(error, data) {
		if(error) throw error;

		root = d3.hierarchy(data, function(d) {return d.children;});
		root.x0 = height / 2;
		root.y0 = 0;

		function collapse(d) {
			if(d.children) {
				d._children = d.children;
				d._children.forEach(collapse);
				d.children = null;
			}
		}

		root.children.forEach(collapse);
		update(root);
	});

	function resize() {
		var sidebarWidth, sidebarHeight;
		if(window.innerWidth <= 600) {
			sidebarWidth = window.innerWidth;
			sidebarHeight = Math.min(window.innerHeight / 2, 300);
			width = window.innerWidth - bounds.left - bounds.right;
			height = window.innerHeight - sidebarHeight - bounds.top - bounds.bottom;
		}
		else {
			sidebarWidth = 250;
			sidebarHeight = window.innerHeight;
			width = window.innerWidth - bounds.left - bounds.right - sidebarWidth;
			height = window.innerHeight - bounds.top - bounds.bottom;
		}

		svg.attr("width", width + bounds.right + bounds.left)
			.attr("height", height + bounds.top + bounds.bottom);
		sidebar.style("width", sidebarWidth + "px")
			.style("height", sidebarHeight + "px");

		depthMultiplier = width / 4.5;
		treemap = d3.tree().size([height, width]);
	}

	var resizeTimeout;
	$(window).resize(function() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function() {
			resize();
			update(root);
		}, 500);
	});
});