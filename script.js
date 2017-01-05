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
	var width = $("#rendererContainer").width();
	var height = $("#rendererContainer").height();
	renderer.setSize(width, height);
	renderer.setClearColor(0x131d29);
	renderer.setPixelRatio(window.devicePixelRatio);

	window.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 10000);
	camera.position.set(0, 0, 250);
	var controls = new THREE.TrackballControls(camera, renderer.domElement);
	camera.lookAt(scene.position);

	var ambient = new THREE.AmbientLight(0x274466);
	scene.add(ambient);

	window.pointlight = new THREE.PointLight(0x5e85b4);
	pointlight.position.set(100, 150, 50);
	pointlight.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereBufferGeometry(2)), new THREE.LineBasicMaterial({color: 0x5e85b4})));
	scene.add(pointlight);

	var faceMaterial = new THREE.MeshPhongMaterial({color: 0x333333, emissive: 0xe91916, side: THREE.DoubleSide, shading: THREE.FlatShading});
	window.uniforms = THREE.UniformsUtils.merge([
		THREE.UniformsLib["lights"],
		{u_time: {type: "f", value: 0}}
	]);
	var shaderMaterial = new THREE.ShaderMaterial({
		lights: true,
		uniforms: uniforms,
		vertexShader: document.getElementById("vertexShader").textContent,
		fragmentShader: document.getElementById("fragmentShader").textContent,
		side: THREE.DoubleSide
	});

	window.box = new THREE.Object3D();
	var top = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100, 100, 100), shaderMaterial);
	top.position.y = 0.5;
	top.rotation.x = Math.PI / 2;
	var base = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100), faceMaterial);
	base.position.y = -0.5;
	base.rotation.x = Math.PI / 2;
	box.add(top);
	box.add(base);
	var sideGeometry = new THREE.PlaneBufferGeometry(100, 1);
	for(var i = 0; i < 4; i++) {
		var f = new THREE.Mesh(sideGeometry, faceMaterial);
		var angle = i * Math.PI / 2;
		f.position.set(50 * Math.sin(angle), 0, 50 * Math.cos(angle));
		f.rotation.y = angle;
		box.add(f);
	}

	box.scale.set(0.01, 1, 0.01);
	scene.add(box);
	TweenLite.to(box.scale, 1, {x: 1, ease: Power3.easeOut});
	TweenLite.to(camera.position, 2, {x: 80, y: 70, z: 225, ease: Power2.easeInOut, delay: 1});
	TweenLite.to(controls.target, 2, {x: 0, y: 0, z: 0, ease: Power2.easeOut, onUpdate: function() {camera.lookAt(controls.target);}, delay: 1});
	TweenLite.to(camera.up, 1.75, {x: 0, y: 1, z: 0, delay: 1});
	TweenLite.to(box.scale, 1, {z: 1, ease: Power3.easeOut, delay: 3});

	var axisHelper = new THREE.AxisHelper(100);
	scene.add(axisHelper);

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
		height = $("#rendererContainer").height();
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	});
});