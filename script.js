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
	function displaceSatelliteGeometry(satelliteGeometry) {
		for(var i = 0; i < satelliteGeometry.vertices.length; i++) {
			var v = satelliteGeometry.vertices[i].clone().setLength(0.4);
			satelliteGeometry.vertices[i].setLength(3 + Math.abs(Math.random()) * 2);
		}
	}

	var animation = {planetRotation: 1, satelliteOrbit: 1};

	var clock = new THREE.Clock();
	var scene = new THREE.Scene();
	var renderer = new THREE.WebGLRenderer({antialias: true});
	$("#rendererContainer").append(renderer.domElement);
	var width = Math.max(window.innerWidth, 100);
	var height = Math.max(window.innerHeight, 100);
	renderer.setSize(width, height);
	renderer.setClearColor(0x131d29);
	renderer.setPixelRatio(window.devicePixelRatio);

	var camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 10000);
	camera.position.set(0, 0, 100);
	scene.add(camera);
	var controls = new THREE.TrackballControls(camera, renderer.domElement);
	camera.lookAt(scene.position);

	var ambient = new THREE.AmbientLight({color: 0xcccccc});
	scene.add(ambient);

	var objectsLeft = 1;

	var material = new THREE.MeshNormalMaterial({side: THREE.DoubleSide, morphTargets: true});
	var geometry;
	var loader = new THREE.OBJLoader();
	loader.load("img/objects/crane.obj", function(object) {
		console.log(object);
		geometry = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry);
	});

	loader.load("img/objects/cube.obj", function(object) {
		var cubeVertices = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry).vertices;
		geometry.morphTargets.push({"name": "cube", "vertices": cubeVertices});
		window.model = new THREE.Mesh(geometry, material);
		scene.add(window.model);
		loaded = true;
	});

	function render() {
		requestAnimFrame(render);
		renderer.render(scene, camera);
		controls.update();

		if(loaded) {
			var delta = clock.getDelta();
			window.model.rotation.y += delta;
		}
	}

	render();

	$(window).resize(function() {
		width = Math.min(window.innerWidth, 100);
		height = Math.min(window.innerHeight, 100);
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	});
});