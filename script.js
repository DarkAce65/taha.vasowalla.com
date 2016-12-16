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

	window.lines = [new THREE.Object3D(), new THREE.Object3D(), new THREE.Object3D()];
	var lineMaterials = [
		new THREE.MeshPhongMaterial({opacity: 0, color: 0x333333, emissive: 0xe91916, side: THREE.DoubleSide, shading: THREE.FlatShading}),
		new THREE.MeshPhongMaterial({opacity: 0, color: 0x333333, emissive: 0xe91916, side: THREE.DoubleSide, shading: THREE.FlatShading}),
		new THREE.MeshPhongMaterial({opacity: 0, color: 0x333333, emissive: 0xe91916, side: THREE.DoubleSide, shading: THREE.FlatShading})
	];
	for(var i = 0; i < 3; i++) {
		for(var j = 0; j < 4; j++) {
			var lGeometry = new THREE.BoxGeometry(0.2, 0.2, 30.2);
			var l = new THREE.Mesh(lGeometry, lineMaterials[i]);

			var angle = Math.PI / 2 * j;
			var ax = 0, ay = angle;
			var x = 15 * Math.cos(angle), y = 0, z = 15 * Math.sin(angle);
			if(i == 0) {
				y = -15;
			}
			else if(i == 1) {
				ax = Math.PI / 2;
				ay = 0;
				x = Math.sqrt(2) * 15 * Math.cos(angle + Math.PI / 4);
				z = Math.sqrt(2) * 15 * Math.sin(angle + Math.PI / 4);
			}
			else {
				y = 15;
			}
			l.position.set(x, y, z);
			l.rotation.set(ax, ay, 0);
			// l.scale.z = 0.00001;
			lines[i].add(l);
		}
		scene.add(lines[i]);
	}

	var loader = new THREE.OBJLoader();
	loader.load("img/objects/crane.obj", function(object) {
		var geometry = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry).scale(8, 8, 8);
		window.crane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0xff4444, side: THREE.DoubleSide, shading: THREE.FlatShading}));
		crane.rotation.y = -Math.PI / 2;
		scene.add(crane);
	});

	TweenMax.to(boxMaterial, 2, {opacity: 1, onComplete: function() {boxMaterial.transparent = false;}, ease: Power4.easeInOut});
	TweenMax.to(scene.rotation, 2, {x: 0, ease: Power4.easeInOut});

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