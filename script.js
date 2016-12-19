"use strict";

window.requestAnimFrame =
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};

$(function() {
	window.timeline = new TimelineLite();
	timeline.addLabel("lines0", 0);
	timeline.addLabel("rotate", "lines0+=1");
	timeline.addLabel("lines1", "rotate+=1.5");
	timeline.addLabel("lines2", "lines1+=1");
	timeline.addLabel("box", "lines2+=1");

	var clock = new THREE.Clock();
	window.scene = new THREE.Scene();
	var renderer = new THREE.WebGLRenderer({antialias: true});
	$("#rendererContainer").append(renderer.domElement);
	var width = $("#rendererContainer").width();
	var height = $("#rendererContainer").height();
	renderer.setSize(width, height);
	renderer.setClearColor(0x131d29);
	renderer.setPixelRatio(window.devicePixelRatio);

	window.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 10000);
	camera.position.set(60, 40, 160);
	var controls = new THREE.TrackballControls(camera, renderer.domElement);
	camera.lookAt(scene.position);
	scene.rotation.x = Math.PI / 2;

	var ambient = new THREE.AmbientLight(0x274466);
	scene.add(ambient);

	window.pointlight = new THREE.PointLight(0x5e85b4);
	pointlight.position.set(30, 60, 10);
	pointlight.add(new THREE.Mesh(new THREE.SphereBufferGeometry(2), new THREE.MeshBasicMaterial({color: 0x5e85b4, wireframe: true})));
	scene.add(pointlight);

	window.boxMaterial = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, shading: THREE.FlatShading});

	window.box = new THREE.Object3D();
	timeline.add(function() {scene.add(box)}, "box");
	for(var i = 0; i < 5; i++) {
		var f = new THREE.Mesh(new THREE.PlaneBufferGeometry(30, 30), boxMaterial);
		f.scale.y = 0.00001;
		switch(i) {
			case 0:
				f.position.y = -15;
				f.rotation.x = Math.PI / 2;
				f.scale.x = 0.00001;
				timeline.to(f.scale, 2, {x: 1, y: 1, ease: Power2.easeInOut}, "box");
				break;
			case 1:
				f.position.y = 15;
				f.rotation.x = Math.PI / 2;
				f.scale.x = 0.00001;
				timeline.to(f.scale, 2, {x: 1, y: 1, ease: Power2.easeInOut}, "box");
				break;
			case 2:
			case 3:
			case 4:
				var angle = i * Math.PI / 2;
				f.position.set(15 * Math.cos(angle), -15, 15 * Math.sin(angle));
				f.rotation.y = angle + Math.PI / 2;
				timeline.to(f.position, 2, {y: 0, ease: Power2.easeInOut}, "box");
				timeline.to(f.scale, 2, {x: 1, y: 1, ease: Power2.easeInOut}, "box");
				break;
		}
		box.add(f);
	}

	window.lines = [new THREE.Object3D(), new THREE.Object3D(), new THREE.Object3D()];
	lines[2].position.y = 15;
	timeline.add(function() {scene.add(lines[0])}, "lines0");
	timeline.add(function() {scene.add(lines[1])}, "lines1");
	timeline.add(function() {scene.add(lines[2])}, "lines2");
	var lineMaterials = [
		new THREE.MeshPhongMaterial({color: 0x333333, emissive: 0xe91916, side: THREE.DoubleSide, shading: THREE.FlatShading}),
		new THREE.MeshPhongMaterial({color: 0x333333, emissive: 0xe91916, side: THREE.DoubleSide, shading: THREE.FlatShading}),
		new THREE.MeshPhongMaterial({color: 0x333333, emissive: 0xe91916, side: THREE.DoubleSide, shading: THREE.FlatShading})
	];
	for(var i = 0; i < 3; i++) {
		var sqrt2 = Math.sqrt(2);
		for(var j = 0; j < 4; j++) {
			var lGeometry = new THREE.BoxBufferGeometry(0.2, 0.2, 30.2);
			var l = new THREE.Mesh(lGeometry, lineMaterials[i]);

			var angle = j * Math.PI / 2;
			var c = 15 * sqrt2 * Math.cos(angle + Math.PI / 4);
			var s = 15 * sqrt2 * Math.sin(angle + Math.PI / 4);
			switch(i) {
				case 0:
				case 2:
					l.position.set(c, 0, s);
					l.rotation.set(0, angle, 0);
					timeline.to(l.position, 1, {x: 15 * Math.cos(angle), z: 15 * Math.sin(angle), ease: Expo.easeInOut}, "lines" + i);
					break;
				case 1:
					l.position.set(c, -15, s);
					l.rotation.set(Math.PI / 2, 0, 0);
					timeline.to(l.position, 1, {y: 0, ease: Expo.easeInOut}, "lines" + i);
					break;
			}
			l.scale.z = 0.00001;
			lines[i].add(l);
			timeline.to(l.scale, 1, {z: 1, ease: Expo.easeInOut}, "lines" + i);
		}
	}

	var objLoader = new THREE.OBJLoader();
	objLoader.load("img/objects/crane.obj", function(object) {
		var geometry = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry);
		window.crane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0xff4444, side: THREE.DoubleSide, shading: THREE.FlatShading}));
		crane.rotation.y = -Math.PI / 2;
		crane.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.BoxBufferGeometry(2, 2, 2))));
		scene.add(crane);
	});

	var loader = new THREE.ObjectLoader();
	loader.load("img/objects/controller.json", function(object) {
		window.controller = new THREE.Object3D();
		var material = new THREE.MeshPhongMaterial({color: 0xff4444, side: THREE.DoubleSide, shading: THREE.FlatShading});
		for(var i = 0; i < object.children.length; i++) {
			object.children[i].material = material;
			controller.add(object.children[i]);
		}
		controller.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.BoxBufferGeometry(1, 1, 1))));
		scene.add(controller);
	});

	timeline.to(scene.rotation, 1.5, {x: 0, ease: Power2.easeInOut}, "rotate");
	timeline.to(lines[0].position, 1.5, {y: -15, ease: Power2.easeInOut}, "rotate");

	var axisHelper = new THREE.AxisHelper(100);
	scene.add(axisHelper);

	render();

	function render() {
		requestAnimFrame(render);
		renderer.render(scene, camera);
		controls.update();
	}

	$(window).resize(function() {
		width = $("#rendererContainer").width();
		height = $("#rendererContainer").height();
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	});
});