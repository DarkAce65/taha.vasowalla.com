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
	var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
	$("#rendererContainer").append(renderer.domElement);
	var width = window.innerWidth;
	var height = Math.min(width, window.innerHeight);
	renderer.setSize(width, height);
	renderer.setPixelRatio(window.devicePixelRatio);

	window.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 10000);
	camera.position.set(0, 0, 250);
	var controls = new THREE.TrackballControls(camera, renderer.domElement);
	camera.lookAt(scene.position);

	window.ambient = new THREE.AmbientLight(0x666666);
	scene.add(ambient);

	window.pointlight = new THREE.PointLight(0xffffdd);
	pointlight.position.set(0, 25, 100);
	scene.add(pointlight);

	var geometry = new THREE.IcosahedronBufferGeometry(50, 1);
	var material = new THREE.MeshPhysicalMaterial({
		transparent: true,
		color: 0x0000ff,
		opacity: 0.5,
		reflectivity: 1
	});
	window.mesh = new THREE.Mesh(geometry, material);
	mesh.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: 0x0000ff})));
	scene.add(mesh);

	render();

	function render() {
		requestAnimFrame(render);
		renderer.render(scene, camera);
		controls.update();
	}

	$(window).resize(function(e) {
		width = window.innerWidth;
		height = Math.min(width, window.innerHeight);
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	});
});
