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
	$("#rendererContainer").append("<div></div>");
	$("#rendererContainer").append(renderer.domElement);
	$("#rendererContainer").append("<div></div>");
	var width = $("#rendererContainer").width();
	var height = $("#rendererContainer").height();
	renderer.setSize(width, height);
	renderer.setClearColor(0x131d29);
	renderer.setPixelRatio(window.devicePixelRatio);

	window.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 10000);
	camera.position.set(0, 0, 250);
	var controls = new THREE.TrackballControls(camera, renderer.domElement);
	camera.lookAt(scene.position);

	var ambient = new THREE.AmbientLight(0xaaaaaa);
	scene.add(ambient);

	window.pointlight = new THREE.PointLight(0xffffff);
	pointlight.position.set(100, 100, 250);
	scene.add(pointlight);

	window.uniforms = THREE.UniformsUtils.merge([
		THREE.UniformsLib["lights"],
		{
			u_noiseColor: {type: "f", value: 0},
			u_time: {type: "f", value: 0},
			u_multiplier: {type: "f", value: 0}
		}
	]);
	var shaderMaterial = new THREE.ShaderMaterial({
		transparent: true,
		lights: true,
		uniforms: uniforms,
		vertexShader: document.getElementById("vertexShader").textContent,
		fragmentShader: document.getElementById("fragmentShader").textContent,
		side: THREE.DoubleSide
	});
	var faceMaterial = new THREE.MeshPhongMaterial({color: 0xf72f35, side: THREE.DoubleSide, shading: THREE.FlatShading});

	window.box = new THREE.Object3D();
	var top = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100, 100, 100), shaderMaterial);
	top.position.y = 1;
	top.rotation.x = Math.PI / 2;
	var base = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100), faceMaterial);
	base.position.y = -1;
	base.rotation.x = Math.PI / 2;
	box.add(top);
	box.add(base);
	var sideGeometry = new THREE.PlaneBufferGeometry(100, 2);
	for(var i = 0; i < 4; i++) {
		var f = new THREE.Mesh(sideGeometry, faceMaterial);
		var angle = i * Math.PI / 2;
		f.position.set(50 * Math.sin(angle), 0, 50 * Math.cos(angle));
		f.rotation.y = angle;
		box.add(f);
	}

	box.scale.set(0.01, 1, 0.01);
	box.position.x = -50;
	scene.add(box);
	TweenLite.to(box.position, 2, {x: 0, ease: Expo.easeInOut});
	TweenLite.to(box.scale, 2, {x: 1, ease: Expo.easeInOut});
	TweenLite.to(uniforms.u_noiseColor, 2, {value: 1, delay: 2});
	TweenLite.to(uniforms.u_multiplier, 2, {value: 1, delay: 2});
	TweenLite.to(camera.position, 2, {x: 170, y: 70, z: 170, onUpdate: function() {camera.lookAt(controls.target);}, delay: 3});
	TweenLite.to(controls.target, 2, {x: 0, y: 0, z: 0, delay: 3});
	TweenLite.to(camera.up, 1.75, {x: 0, y: 1, z: 0, delay: 3});
	TweenLite.to(box.scale, 1, {z: 1, delay: 3});
	TweenLite.to("#rendererContainer", 2, {width: "50%", onUpdate: function() {
		width = $("#rendererContainer").width();
		height = Math.min(width, $("#rendererContainer").height());
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}, delay: 5});

	// if(Cookies.get("animated")) {
	// 	timeline.seek("menu+=1", false);
	// }
	// else {
	// 	timeline.add(function() {Cookies.set("animated", true, {path: "", expires: 1 / 144});}, "menu");
	// }
	render();

	function render() {
		requestAnimFrame(render);
		renderer.render(scene, camera);
		controls.update();

		uniforms.u_time.value += clock.getDelta();
	}

	$(window).resize(function(e) {
		width = $("#rendererContainer").width();
		height = Math.min(width, $("#rendererContainer").height());
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	});
});