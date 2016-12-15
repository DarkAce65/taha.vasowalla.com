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
	scene.rotation.x = Math.PI / 2;

	var ambient = new THREE.AmbientLight(0x274466);
	scene.add(ambient);

	window.pointlight = new THREE.PointLight(0x5e85b4);
	pointlight.position.set(30, 60, 10);
	pointlight.add(new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({color: 0x5e85b4, wireframe: true})));
	scene.add(pointlight);

	window.boxMaterial = new THREE.MeshPhongMaterial({
		transparent: true,
		opacity: 0,
		side: THREE.DoubleSide,
		shading: THREE.FlatShading
	});

	window.box = new THREE.Object3D();
	for(var i = 0; i < 5; i++) {
		var f = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), boxMaterial);
		f.position.z = -15;
		if(i < 4) {
			f.rotation.x = Math.PI / 2;
			var angle = Math.PI / 2 * i;
			f.rotation.y = angle + Math.PI / 2;
			f.position.set(15 * Math.cos(angle), 15 * Math.sin(angle), 0);
		}
		box.add(f);
	}
	scene.add(box);

	window.lines = new THREE.Object3D();
	for(var i = 0; i < 4; i++) {
		var angle = Math.PI / 2 * (1 - i);
		var lGeometry = new THREE.BoxGeometry(0.2, 0.2, 30.2);
		var lMaterial = new THREE.MeshPhongMaterial({transparent: true, opacity: 1, color: 0x333333, emissive: 0xe91916, side: THREE.DoubleSide, shading: THREE.FlatShading});
		var l = new THREE.Mesh(lGeometry, lMaterial);
		l.position.set(15 * Math.cos(angle), 0, 15 * Math.sin(angle));
		l.rotation.set(0, angle, 0);
		// l.scale.z = 0.00001;
		lines.add(l);
	}
	lines.position.y = -15;
	scene.add(lines);

	var planeGeometry = new THREE.PlaneGeometry(30, 30);
	window.plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({side: THREE.DoubleSide, shading: THREE.FlatShading}));
	plane.position.z = 15;
	// scene.add(plane);

	var loader = new THREE.OBJLoader();
	loader.load("img/objects/crane.obj", function(object) {
		var geometry = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry).scale(8, 8, 8);
		window.crane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0xff4444, side: THREE.DoubleSide, shading: THREE.FlatShading}));
		crane.rotation.y = -Math.PI / 2;
		scene.add(crane);
	});

	TweenMax.to(boxMaterial, 2, {opacity: 1, ease: Power4.easeInOut});
	TweenMax.to(scene.rotation, 2, {x: 0, ease: Power4.easeInOut});
	// for(var i = 0; i < lines.children.length; i++) {
	// 	TweenMax.to(lines.children[i].material.color, 1, {r: 0.3, g: 0.3, b: 0.3, delay: 1 + i * 0.25});
	// 	TweenMax.to(lines.children[i].material.emissive, 1, {r: 239 / 255, g: 83 / 255, b: 80 / 255, delay: 1 + i * 0.25});
	// }

	var axisHelper = new THREE.AxisHelper( 100 );
	scene.add( axisHelper );

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