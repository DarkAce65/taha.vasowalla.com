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
	function setCamera(position) {
		var x = 0, y = 0, z = 0,
			uy = 0, uz = 0,
			tx = 0, ty = 0, tz = 0;

		if(cubeKeys.indexOf(position) != -1) {
			tx = cubes[position].position.x;
			ty = cubes[position].position.y;
			x = tx + 100;
			y = ty - 180;
			z = 100;
			uz = 1;
		}
		else {
			x = 0;
			y = 0;
			uy = 1;
			if(viewportBounds.maxY / viewportBounds.maxX < camera.aspect) {
				z = viewportBounds.maxY / Math.tan(camera.fov * Math.PI / 360);
			}
			else {
				z = viewportBounds.maxX / Math.tan(camera.fov * Math.PI / 360) / camera.aspect;
			}
			z += 70 / 2;
			z /= factor;
		}

		x *= factor;
		y *= factor;
		z *= factor;

		TweenLite.to(camera.position, 2, {x: x, y: y, z: z, ease: Power2.easeInOut});
		TweenLite.to(controls.target, 2, {x: tx, y: ty, z: tz, ease: Power2.easeOut, onUpdate: function(){camera.lookAt(controls.target);}});
		TweenLite.to(camera.up, 1.75, {x: 0, y: uy, z: uz});
	}

	function shaderConfig(vertex, fragment) {
		return {
			"uniforms": uniforms,
			"vertexShader": document.getElementById(vertex).textContent,
			"fragmentShader": document.getElementById(fragment).textContent
		}
	}

	var uniforms = {
		u_time: {type: "f", value: 0},
		u_resolution: {type: "v2", value: new THREE.Vector2},
		u_rows: {type: "f", value: 40.0},
		u_speed: {type: "f", value: 4.0}
	};
	uniforms.u_rows.value = window.innerWidth < 768 ? 20 : 40;

	var factor = window.innerWidth < 768 ? 1.5 : 1;

	var clock = new THREE.Clock();
	var scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000); // 0xD5DDFF - Gray
	var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
	$("#rendererContainer").append(renderer.domElement);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;

	var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 10000);
	camera.position.set(0, 0, 100);
	var controls = new THREE.TrackballControls(camera, renderer.domElement);
	camera.lookAt(scene.position);

	var cubes = {};
	var cubeGeometry = new THREE.BoxGeometry(70, 70, 70);

	var material = new THREE.ShaderMaterial(shaderConfig("noiseVertexShader", "noiseFragmentShader"));
	material.side = THREE.DoubleSide;
	cubes["Noise"] = new THREE.Mesh(new THREE.BoxGeometry(70, 70, 70, 70, 70, 70), material);

	var material = new THREE.ShaderMaterial(shaderConfig("pulseVertexShader", "pulseFragmentShader"));
	material.transparent = true;
	material.side = THREE.DoubleSide;
	cubes["Pulse"] = new THREE.Mesh(new THREE.BoxGeometry(70, 70, 70, 70, 70, 70), material);

	var material = new THREE.ShaderMaterial(shaderConfig("staticVertexShader", "matrixFragmentShader"));
	material.side = THREE.DoubleSide;
	cubes["Matrix"] = new THREE.Mesh(cubeGeometry, material);

	var material = new THREE.ShaderMaterial(shaderConfig("staticVertexShader", "transparentFragmentShader"));
	material.side = THREE.FrontSide;
	material.transparent = true;
	var mesh = new THREE.Mesh(cubeGeometry, material);
	mesh.renderOrder = 2;

	var material = new THREE.ShaderMaterial(shaderConfig("staticVertexShader", "transparentFragmentShader"));
	material.side = THREE.BackSide;
	material.transparent = true;
	var transparentCube = new THREE.Object3D();
	transparentCube.add(new THREE.Mesh(cubeGeometry, material));
	transparentCube.add(mesh);
	cubes["Transparent"] = transparentCube;

	var cubeKeys = Object.keys(cubes);
	var viewportBounds = {"maxX": 0, "maxY": 0};
	for(var i = 0; i < cubeKeys.length; i++) {
		var angle = 2 * Math.PI * i / cubeKeys.length;
		var c = 100 * Math.cos(angle);
		var s = 100 * Math.sin(angle);
		cubes[cubeKeys[i]].position.set(c, s, 0);
		viewportBounds.maxX = Math.max(viewportBounds.maxX, Math.abs(c));
		viewportBounds.maxY = Math.max(viewportBounds.maxY, Math.abs(s));
		scene.add(cubes[cubeKeys[i]]);
		$("#cubeDropdown").append('<li><a id="' + cubeKeys[i] + '" class="view" href="javascript:void(0)">' + cubeKeys[i] + ' Cube</a></li>');
	}
	$(".view").click(function(e) {
		setCamera(e.target.id);
	});
	viewportBounds.maxX += 50;
	viewportBounds.maxY += 50;

	function render() {
		requestAnimFrame(render);
		renderer.render(scene, camera);
		controls.update();
		uniforms.u_time.value += clock.getDelta() * 3;
	}

	render();
	setCamera("Overview");

	$(window).resize(function() {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		factor = 1;
		uniforms.u_rows.value = 40;
		if(window.innerWidth < 768) {
			factor = 1.5;
			uniforms.u_rows.value = 20;
		}
	});
});