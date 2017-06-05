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
	camera.position.set(250, 0, 0);
	var controls = new THREE.TrackballControls(camera, renderer.domElement);
	camera.lookAt(scene.position);

	window.ambient = new THREE.AmbientLight(0x666666);
	scene.add(ambient);

	window.cubeCamera = new THREE.CubeCamera(1, 1000, 256);
	cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
	scene.add(cubeCamera);

	var loader = new THREE.TextureLoader();
	loader.setPath("../img/textures/");

	window.texture = loader.load("room.jpg");
	window.skybox = new THREE.Mesh(new THREE.SphereBufferGeometry(1000, 16, 16), new THREE.MeshBasicMaterial({map: texture}));
	skybox.scale.x = -1;
	scene.add(skybox);

	var geometry = new THREE.BoxBufferGeometry(64, 64, 64);
	var material = new THREE.MeshBasicMaterial({
		transparent: true,
		color: 0x2222ff,
		opacity: 0.75,
		envMap: cubeCamera.renderTarget.texture
	});
	window.mesh = new THREE.Mesh(geometry, material);
	mesh.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: 0x0000ff})));
	scene.add(mesh);

	window.box = new THREE.Mesh(new THREE.BoxBufferGeometry(5, 16, 16), new THREE.MeshNormalMaterial());
	scene.add(box);

	var c = 0;
	render();

	function render() {
		requestAnimFrame(render);
		renderer.render(scene, camera);
		controls.update();
		box.rotation.set(c / 50, c / 50, c / 50);
		box.position.set(100 * Math.cos(c / 100), 0, 100 * Math.sin(c / 100));

		if(c % 2 === 0) {
			mesh.material.envMap = cubeCamera.renderTarget.texture;
		}
		else {
			mesh.visible = false;
			cubeCamera.updateCubeMap(renderer, scene);
			mesh.visible = true;
		}
		c++;
	}

	$(window).resize(function(e) {
		width = window.innerWidth;
		height = Math.min(width, window.innerHeight);
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	});
});
