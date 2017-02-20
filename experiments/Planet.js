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
		noise.seed(Math.random());
		for(var i = 0; i < satelliteGeometry.vertices.length; i++) {
			var v = satelliteGeometry.vertices[i].clone().setLength(0.4);
			satelliteGeometry.vertices[i].setLength(3 + Math.abs(noise.simplex3(v.x, v.y, v.z)) * 2);
		}
	}

	var factor = window.innerWidth < 768 ? 1.5 : 1;
	var animation = {planetRotation: 1, satelliteOrbit: 1};

	var clock = new THREE.Clock();
	var scene = new THREE.Scene();
	scene.background = new THREE.Color(0x131d29);
	var renderer = new THREE.WebGLRenderer({antialias: true});
	$("#rendererContainer").append(renderer.domElement);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);

	var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 10000);
	camera.position.set(-50, -300, 100);
	var controls = new THREE.TrackballControls(camera, renderer.domElement);
	camera.lookAt(scene.position);

	var lights = [];

	// lights[0] = new THREE.PointLight(0xffffff, 3);

	lights[0] = new THREE.PointLight(0xeeeefe, 2, 300, 1.5);
	lights[0].position.set(45, 15, 105);

	lights[1] = new THREE.PointLight(0x423e6a, 1, 1200, 2);
	lights[1].position.set(-90, 10, 120);

	lights[2] = new THREE.PointLight(0x513c1f, 1, 300, 3);
	lights[2].position.set(40, -40, 80);

	for(var i = 0; i < lights.length; i++) {
		scene.add(lights[i]);
	}

	var planetMaterial = new THREE.MultiMaterial([
		new THREE.MeshPhongMaterial({
			morphTargets: true,
			shininess: 30,
			color: 0x526464,
			side: THREE.DoubleSide,
			shading: THREE.FlatShading
		}),
		new THREE.MeshPhongMaterial({
			transparent: true,
			morphTargets: true,
			shininess: 30,
			color: 0x526464,
			opacity: 0,
			side: THREE.DoubleSide,
			shading: THREE.FlatShading
		})
	]);
	var planetGeometry = new THREE.IcosahedronGeometry(60, 3);
	var implodedVertices = [];
	var cubeVertices = [];
	for(var i = 0; i < planetGeometry.vertices.length; i++) {
		implodedVertices[i] = planetGeometry.vertices[i].clone().setLength(0.01);
		planetGeometry.vertices[i].x += Math.random() * 6 - 3;
		planetGeometry.vertices[i].y += Math.random() * 6 - 3;
		planetGeometry.vertices[i].setLength(59 + Math.random() * 2);
		cubeVertices[i] = planetGeometry.vertices[i].clone().clampScalar(-30, 30);
	}
	for(var i = 0; i < planetGeometry.faces.length; i++) {
		planetGeometry.faces[i].materialIndex = 0; //Math.round(Math.random());
	}
	planetGeometry.morphTargets.push({"name": "implode", "vertices": implodedVertices});
	planetGeometry.morphTargets.push({"name": "cube", "vertices": cubeVertices});
	var planet = new THREE.Mesh(planetGeometry, planetMaterial);
	scene.add(planet);

	var satellites = [];
	var satelliteMaterial = new THREE.MeshPhongMaterial({
		shininess: 30,
		color: 0x526464,
		side: THREE.DoubleSide,
		shading: THREE.FlatShading
	});
	for(var i = 0; i < 300; i++) {
		var radius = Math.max(0.2, Math.pow(Math.random(), 2) * 3);
		var detail = radius > 2.5 ? 1 : 0;
		var satelliteGeometry = new THREE.IcosahedronGeometry(radius, detail);
		if(radius > 2.5) {
			displaceSatelliteGeometry(satelliteGeometry);
		}
		var positionR = 110 - Math.random() * 30;
		var c = positionR * Math.cos(i * Math.PI / 150);
		var s = positionR * Math.sin(i * Math.PI / 150);
		satelliteGeometry.applyMatrix(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.random(), Math.random(), Math.random(), "XYZ")));
		satelliteGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(c, s, Math.random() * 30 - 15));
		var satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
		satellite.orbitSpeed = 0.3 / radius;
		scene.add(satellite);
		satellites.push(satellite);
	}

	function render() {
		requestAnimFrame(render);
		renderer.render(scene, camera);
		controls.update();

		var delta = clock.getDelta();
		planet.rotation.z += delta * animation.planetRotation / 5;
		for(var i = 0; i < satellites.length; i++) {
			satellites[i].rotation.z += satellites[i].orbitSpeed * delta * animation.satelliteOrbit;
		}
	}

	render();

	$(window).resize(function() {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		factor = window.innerWidth < 768 ? 1.5 : 1;
	});
});