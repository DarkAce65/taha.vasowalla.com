var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize($(".content").width() * 1.5, 450);
$("#threeContainer").append(renderer.domElement);
renderer.shadowMap.enabled = true;
var camera = new THREE.OrthographicCamera(-$(".content").width() / 2, $(".content").width() / 2, 150, -150, 0.1, 1000);

var ambientLight = new THREE.AmbientLight(0x777777);
scene.add(ambientLight);
var light = new THREE.SpotLight(0xdddddd);
scene.add(light);
light.position.y = 100;
light.distance = 250;
var sphere = new THREE.SphereGeometry(2, 16, 8);
var light1 = new THREE.SpotLight(0x7777ff);
light1.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0x4444ff})));
scene.add(light1);
light1.position.set(0, -60, 85)
var light2 = new THREE.SpotLight(0x7777ff);
light2.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0x4444ff})));
scene.add(light2);
light2.position.set(0, -60, -85)
var light3 = new THREE.SpotLight(0x7777ff);
light3.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0x4444ff})));
scene.add(light3);
light3.position.set(85, -60, 0)
var light4 = new THREE.SpotLight(0x7777ff);
light4.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0x4444ff})));
scene.add(light4);
light4.position.set(-85, -60, 0)

var cylinderGeometry = new THREE.CylinderGeometry(100, 120, 40, 32);
var torusGeometry = new THREE.TorusKnotGeometry(60, 15, 64, 8);
var material = new THREE.MeshPhongMaterial({wireframe: true, color: 0xc0c0c0, shininess: 75});
var torus = new THREE.Mesh(torusGeometry, material);
material = new THREE.MeshLambertMaterial({color: 0xeeeeee});
var base = new THREE.Mesh(cylinderGeometry, material);
var angle = 0;

scene.add(torus);
scene.add(base);
torus.castShadow = true;
base.recieveShadow = true;
camera.position.z = 150;
camera.rotation.x = -Math.PI / 12;
torus.rotation.x = Math.PI / 2;
base.position.y = -80;

function render() {
	requestAnimationFrame(render);
	torus.rotation.z += 0.003;
	torus.position.y = 2 * Math.sin(angle);
	angle += 0.02;
	renderer.render(scene, camera);
}

$(window).resize(function() {
	renderer.setSize($(".content").width() * 1.5, 450);
	camera.left = -$(".content").width() / 2;
	camera.right = $(".content").width() / 2;
	camera.updateProjectionMatrix();
});

render();