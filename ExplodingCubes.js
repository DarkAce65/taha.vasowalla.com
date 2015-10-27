window.requestAnimFrame =
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 0, 1500);
var controls = new THREE.TrackballControls(camera);
var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
var light = new THREE.PointLight(0x333333, 0.2, 0);
var sphere = new THREE.SphereGeometry(5, 16, 8);
light.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0x333333})));
scene.add(light);
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(-300, 1000, -100);
scene.add(directionalLight);

var cubes = [];
var geometry = new THREE.BoxGeometry(75, 75, 75, 50, 5, 1);
var material = new THREE.MeshPhongMaterial();
for(var i = 0; i < 100; i++) {
	var cube = new THREE.Mesh(geometry, material);
	cubes.push(cube);
	scene.add(cube);
	cube.radius = chance.integer({min: 500, max: 750});
	cube.angle = chance.floating({min: 0, max: 2 * Math.PI});
	cube.nx = chance.floating({min: -1, max: 1});
	cube.ny = chance.floating({min: -1, max: 1});
	cube.nz = chance.floating({min: -1, max: 1});
	cube.rx = cube.nx;
	cube.ry = cube.ny;
	cube.rz = cube.nz;
	TweenLite.to(cubes[i].rotation, .8, {x: cube.nx, y: cube.ny, z: cube.nz});
	var normalize = Math.sqrt(cube.nx*cube.nx + cube.ny*cube.ny + cube.nz*cube.nz);
	cube.nx /= normalize;
	cube.ny /= normalize;
	cube.nz /= normalize;
	cube.nx *= cube.radius;
	cube.ny *= cube.radius;
	cube.nz *= cube.radius;
	TweenLite.to(cubes[i].position, .8, {x: cube.nx, y: cube.ny, z: cube.nz, ease: Back.easeOut.config(3)});
	var scale = chance.floating({min: 0.25, max: 2});
	TweenLite.to(cubes[i].scale, .8, {x: scale, y: scale, z: scale, ease: Back.easeOut.config(3)});
}

for(var i = 0; i < cubes.length; i++) {
	var cube = cubes[i];
	var x = cube.nx / 3;
	var y = cube.ny / 3;
	var z = cube.nz / 3;
	var rx = cube.rx;
	var ry = cube.ry;
	var rz = cube.rz;
	TweenLite.to(cubes[i].position, 10, {x: x, y: y, z: z, ease: Sine.easeIn, delay: 0.8});
	TweenLite.to(cubes[i].rotation, 10, {x: rx / 3, y: ry / 3, z: rz / 3, ease: Sine.easeIn, delay: 0.8});
	x = cube.nx * 3;
	y = cube.ny * 3;
	z = cube.nz * 3;
	TweenLite.to(cubes[i].position, 0.7, {x: x, y: y, z: z, ease: Power3.easeOut, delay: 11.8});
	TweenLite.to(cubes[i].rotation, 0.7, {x: rx, y: ry, z: rz, ease: Power3.easeOut, delay: 11.8});
}
for(var i = 0; i < 236; i++) {
	var rand = chance.floating({min: -1, max: 1});
	var tween = Math.pow(Math.E, 0.025 * i - 2);
	TweenLite.to(scene.position, 0.05, {x: scene.position.x + rand * tween, y: scene.position.y + rand * tween, z: scene.position.z + rand * tween, delay: 0.05 * i});
}
TweenLite.to(scene.position, 0.05, {x: 0, y: 0, z: 0, delay: 0.05 * 237});
TweenLite.to(light.color, 10, {r: 0.69, g: 0.69, b: 1, ease: Sine.easeIn, delay: 0.8});
TweenLite.to(light.children[0].material.color, 10, {r: 0.9, g: 0.9, b: 1, ease: Sine.easeIn, delay: 0.8});
TweenLite.to(light, 10, {intensity: 3, ease: Sine.easeIn, delay: 0.8});

$("#threeContainer").append(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

var render = function() {
	requestAnimFrame(render);
	renderer.render(scene, camera);
	controls.update();
}

render();

$(window).resize(function() {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});

$(window).load(function() {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});