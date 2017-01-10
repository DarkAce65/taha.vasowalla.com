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
	var factor = window.innerWidth < 768 ? 1.5 : 1;

	var loader = new THREE.TextureLoader();
	var clock = new THREE.Clock();
	var scene = new THREE.Scene();
	scene.background = new THREE.Color(0x3d3d3d);
	var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
	$("#rendererContainer").append(renderer.domElement);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);

	var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 10000);
	camera.position.set(0, 0, 100 * factor);
	var controls = new THREE.TrackballControls(camera, renderer.domElement);
	camera.lookAt(scene.position);

	var uniforms = {
		u_time: {type: "f", value: 0},
		u_textureMap: {type: "t", value: null}
	};
	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: document.getElementById("vertexShader").textContent,
		fragmentShader: document.getElementById("fragmentShader").textContent,
		side: THREE.DoubleSide
	});
	var objectGeometry = new THREE.IcosahedronGeometry(20, 4);
	var object = new THREE.Mesh(objectGeometry, material);
	scene.add(object);

	function setCamera(position) {
		var x = 0, y = 0, z = 0,
			uy = 0;

		switch(position) {
			case "Reset":
			default:
				x = 0;
				y = 0;
				z = 100;
				uy = 1;
				break;
		}

		x *= factor;
		y *= factor;
		z *= factor;

		TweenLite.to(camera.position, 2, {x: x, y: y, z: z, ease: Power2.easeInOut});
		TweenLite.to(controls.target, 2, {x: 0, y: 0, z: 0, ease: Power2.easeOut, onUpdate: function(){camera.lookAt(controls.target);}});
		TweenLite.to(camera.up, 1, {x: 0, y: uy, z: 0});
	}

	function render() {
		requestAnimFrame(render);
		renderer.render(scene, camera);
		controls.update();

		var delta = clock.getDelta();
		uniforms.u_time.value += delta * 0.6;
	}

	loader.load("texture.png", function(texture) {
		uniforms.u_textureMap.value = texture;
	});
	render();

	$(window).resize(function() {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		factor = window.innerWidth < 768 ? 1.5 : 1;
	});

	$("#reset").click(function() {
		setCamera("Reset");
	});
});