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
	var height = Math.min(width, $("#rendererContainer").height());
	renderer.setSize(width, height);
	renderer.setPixelRatio(window.devicePixelRatio);

	window.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 10000);
	camera.position.set(0, 0, 250);
	var controls = new THREE.TrackballControls(camera, renderer.domElement);
	camera.lookAt(scene.position);

	var ambient = new THREE.AmbientLight(0x666666);
	scene.add(ambient);

	window.pointlight = new THREE.PointLight(0xffffff);
	pointlight.position.set(100, 100, 250);
	scene.add(pointlight);

	window.uniforms = THREE.UniformsUtils.merge([
		THREE.ShaderLib["phong"].uniforms,
		{
			diffuse: {type: "v3", value: new THREE.Color(0x5e85b4)},
			opacity: {type: "f", value: 0.75},
			u_time: {type: "f", value: 0},
			u_multiplier: {type: "f", value: 0},
			u_uvscale: {type: "v2", value: new THREE.Vector2(20, 20)}
		}
	]);
	var waveShaderMaterial = new THREE.ShaderMaterial({
		transparent: true,
		lights: true,
		defines: {"FLAT_SHADED": 1},
		extensions: {derivatives: true},
		uniforms: uniforms,
		vertexShader: document.getElementById("vertexShader").textContent,
		fragmentShader: THREE.ShaderLib["phong"].fragmentShader,
		side: THREE.DoubleSide
	});
	var wireShaderMaterial = new THREE.ShaderMaterial({
		transparent: true,
		wireframe: true,
		uniforms: uniforms,
		vertexShader: document.getElementById("vertexShader").textContent,
		fragmentShader: document.getElementById("wireFragmentShader").textContent,
		side: THREE.DoubleSide
	});
	var faceMaterial = new THREE.MeshPhongMaterial({color: 0x5e85b4, side: THREE.DoubleSide, shading: THREE.FlatShading});

	window.box = new THREE.Object3D();
	var top = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, uniforms.u_uvscale.value.x, uniforms.u_uvscale.value.y), waveShaderMaterial);
	top.add(new THREE.Mesh(new THREE.PlaneGeometry(100, 100, uniforms.u_uvscale.value.x, uniforms.u_uvscale.value.y), wireShaderMaterial));
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
	scene.add(box);

	var rockGeometry = new THREE.IcosahedronGeometry(20, 2);
	var rockMaterial = new THREE.MeshPhongMaterial({color: 0x666666, shininess: 0, shading: THREE.FlatShading});
	for(var i = 0; i < rockGeometry.vertices.length; i++) {
		rockGeometry.vertices[i].x += Math.random() * 3 - 1.5;
		rockGeometry.vertices[i].y = Math.max(Math.min(rockGeometry.vertices[i].y + Math.random() * 3 - 1.5, 18), 0);
		rockGeometry.vertices[i].z += Math.random() * 3 - 1.5;
	}
	window.rock = new THREE.Mesh(rockGeometry, rockMaterial);
	rock.position.set(15, -1, -5);
	scene.add(rock);

	if(Cookies.get("animated")) {
		uniforms.u_multiplier.value = 1;
		$("#overlay").addClass("in");
		camera.position.set(70, 60, 190);
		camera.lookAt(scene.position);
	}
	else {
		scene.scale.z = 0.01;
		box.scale.x = 0.01;
		box.position.x = -50;
		TweenLite.to(box.position, 2, {x: 0, ease: Expo.easeInOut});
		TweenLite.to(box.scale, 2, {x: 1, ease: Expo.easeInOut});
		TweenLite.to(uniforms.u_multiplier, 2, {value: 1, delay: 2});
		TweenLite.to(camera.position, 2, {x: 70, y: 60, z: 190, onUpdate: function() {camera.lookAt(scene.position);}, delay: 3});
		TweenLite.to(controls.target, 2, {x: 0, y: 0, z: 0, delay: 3});
		TweenLite.to(camera.up, 1.75, {x: 0, y: 1, z: 0, delay: 3});
		TweenLite.to(scene.scale, 1, {z: 1, delay: 3});
		setTimeout(function() {
			$("#overlay").addClass("in");
			Cookies.set("animated", true, {path: "", expires: 1 / 144});
		}, 5000);
	}
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