document.addEventListener("DOMContentLoaded", function(event) {
	var bounds = {top: 20, right: 20, bottom: 20, left: 90};
	var width = window.innerWidth - bounds.left - bounds.right;
	var height = window.innerHeight - bounds.top - bounds.bottom;

	var levels = 1, depthMultiplier = width / levels;
	var treemap;

	var svg = d3.select("#tree");
	var boundary = svg.append("g").attr("transform", "translate(" + bounds.left + "," + bounds.top + ")");

	var sidebar = d3.select("#sidebar");
	var sidebarContainer = sidebar.select("#content");

	resize();

	var root, i = 0, duration = 750;
	var wait = false;

	function update(source) {
		function diagonal(s, d) { // Creates a curved (diagonal) path from parent to the child nodes
			path = `M ${s.y} ${s.x}
			C ${(s.y + d.y) / 2} ${s.x},
			${(s.y + d.y) / 2} ${d.x},
			${d.y} ${d.x}`;

			return path;
		}

		function click(d) {
			wait = true;
			setTimeout(function() {wait = false;}, duration / 2);
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

		function hover(d) {
			if(!wait) {
				var content = d.data.content ? d.data.content : "";
				var title = d.data.title ? d.data.title : d.data.name;
				sidebarContainer.html('<p class="h3 title Quicksand">' + title + '</p><hr><div class="content">' + content + '</div>');
			}
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

		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(d) {
				return "translate(" + source.y0 + "," + source.x0 + ")";
			})
			.on("click", click)
			.on("mouseenter", hover)
			.classed("collapsed", function(d) {
				return d._children ? true : false;
			});

		// Add circle for the nodes
		nodeEnter.append("circle").attr("r", 1e-6);

		// Add labels for the nodes
		nodeEnter.append("text")
			.attr("dy", ".35em")
			.attr("x", -12)
			.attr("text-anchor", "end")
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
		nodeUpdate.classed("collapsed", function(d) {
			return d._children ? true : false;
		});
		nodeUpdate.select("circle").attr("r", 4);

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
		levels = root.height;
		depthMultiplier = width / levels;

		function collapse(d) {
			if(d.children) {
				d._children = d.children;
				d._children.forEach(collapse);
				d.children = null;
			}
		}

		root.children.forEach(collapse);
		var content = root.data.content ? root.data.content : "";
		var title = root.data.title ? root.data.title : root.data.name;
		sidebarContainer.html('<p class="h3 title Quicksand">' + title + '</p><hr><div class="content">' + content + '</div>');
		update(root);
	});

	function resize() {
		var sidebarWidth, sidebarHeight;
		if(window.innerWidth <= 600) {
			var h = Math.min(window.innerHeight / 2, 300);
			width = window.innerWidth - bounds.left - bounds.right;
			height = window.innerHeight - h - bounds.top - bounds.bottom;
			sidebarWidth = "100%";
			sidebarHeight = h + "px";
		}
		else {
			width = window.innerWidth - bounds.left - bounds.right - 300;
			height = window.innerHeight - bounds.top - bounds.bottom;
			sidebarWidth = "300px";
			sidebarHeight = "100%";
		}

		svg.attr("width", width + bounds.right + bounds.left)
			.attr("height", height + bounds.top + bounds.bottom);
		sidebar.style("width", sidebarWidth)
			.style("height", sidebarHeight);

		depthMultiplier = width / levels;
		treemap = d3.tree().size([height, width]);
	}

	var resizeTimeout;
	window.addEventListener("resize", function() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function() {
			resize();
			update(root);
		}, 500);
	});
});