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

	var clock = new THREE.Clock(false);
	var scene = new THREE.Scene();
	var renderer = new THREE.WebGLRenderer({antialias: true});
	$("#rendererContainer").append(renderer.domElement);
	var width = Math.min(window.innerWidth, 200);
	var height = Math.min(window.innerHeight, 200);
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

	var objectsLeft = 2;

	var material = new THREE.MeshNormalMaterial({side: THREE.DoubleSide, morphTargets: true});
	var geometry, model;
	var loader = new THREE.OBJLoader();
	loader.load("img/objects/cube.obj", function(object) {
		objectsLeft--;
		geometry = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry);

		loader.load("img/objects/crane.obj", function(object) {
			objectsLeft--;
			var craneVertices = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry).vertices;
			geometry.morphTargets.push({"name": "crane", "vertices": craneVertices});
			loadedObject();
		});
	});

	function loadedObject() {
		if(objectsLeft <= 0) {
			model = new THREE.Mesh(geometry, material);
			model.scale.multiplyScalar(20);
			scene.add(model);
		}

		clock.start();
		render();
	}

	function render() {
		requestAnimFrame(render);
		renderer.render(scene, camera);
		controls.update();

		var delta = clock.getDelta();
		model.rotation.y += delta / 4;
		var elapsed = clock.getElapsedTime() / 2;
		model.morphTargetInfluences[0] = 0.5 - Math.min(0.5, Math.max(-0.5, Math.cos(elapsed)));
	}

	$(window).resize(function() {
		width = Math.min(window.innerWidth, 200);
		height = Math.min(window.innerHeight, 200);
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	});
});