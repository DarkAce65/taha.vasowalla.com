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

	var ambient = new THREE.AmbientLight(0x274466);
	camera.add(ambient);

	var pointlight = new THREE.PointLight(0x5E85B4);
	pointlight.position.set(0, 50, 0);
	camera.add(pointlight);

	scene.add(camera);

	var cubeGeometry = new THREE.BoxGeometry(30, 30, 30);
	var cubeMaterial = new THREE.MultiMaterial([
		new THREE.MeshPhongMaterial({
			side: THREE.DoubleSide,
			shading: THREE.FlatShading
		}),
		new THREE.MeshPhongMaterial({
			transparent: true,
			opacity: 0,
			side: THREE.DoubleSide,
			shading: THREE.FlatShading
		})
	]);

	for(var i = 0; i < cubeGeometry.faces.length; i++) {
		cubeGeometry.faces[i].materialIndex = (i > 7 && i < 10) ? 1 : 0;
	}
	window.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	scene.add(cube);

	window.lines = new THREE.Object3D();
	var linesGeometry = new THREE.BoxGeometry(0.2, 0.2, 30.2);
	for(var i = 0; i < 4; i++) {
		var angle = Math.PI / 2 * (1 - i);
		var lMaterial = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, shading: THREE.FlatShading});
		var l = new THREE.Mesh(linesGeometry, lMaterial);
		l.position.set(15 * Math.cos(angle), 15 * Math.sin(angle), 0);
		l.rotation.set(Math.PI / 2, angle, 0);
		lines.add(l);
	}
	lines.position.z = 15;
	scene.add(lines);

	var planeGeometry = new THREE.PlaneGeometry(30, 30);
	window.plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({side: THREE.DoubleSide, shading: THREE.FlatShading}));
	plane.position.z = 15;
	scene.add(plane);

	var loader = new THREE.OBJLoader();
	loader.load("img/objects/crane.obj", function(object) {
		var geometry = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry).scale(8, 8, 8);
		window.crane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0xff4444, side: THREE.DoubleSide, shading: THREE.FlatShading}));
		crane.rotation.y = -Math.PI / 2;
		scene.add(crane);
	});

	TweenMax.to(plane.position, 1, {z: 100, delay: 2, ease: Power4.easeInOut});
	TweenMax.to(plane.rotation, 1, {x: Math.PI, delay: 2, ease: Power4.easeInOut});
	for(var i = 0; i < lines.children.length; i++) {
		TweenMax.to(lines.children[i].material.color, 1, {r: 0.3, g: 0.3, b: 0.3, delay: 1 + i * 0.25});
		TweenMax.to(lines.children[i].material.emissive, 1, {r: 239 / 255, g: 83 / 255, b: 80 / 255, delay: 1 + i * 0.25});
	}

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