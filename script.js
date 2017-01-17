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

	window.ambient = new THREE.AmbientLight(0x666666);
	scene.add(ambient);

	window.pointlight = new THREE.PointLight(0xffffdd);
	pointlight.position.set(250, 100, -100);
	scene.add(pointlight);

	window.uniforms = THREE.UniformsUtils.merge([
		THREE.ShaderLib["phong"].uniforms,
		{
			diffuse: {type: "v3", value: new THREE.Color(0x5f93d3)},
			opacity: {type: "f", value: 0.75},
			u_time: {type: "f", value: 0},
			u_intensity: {type: "f", value: 0},
			u_multiplier: {type: "f", value: 0},
			u_wavesize: {type: "v2", value: new THREE.Vector2(200, 200)},
			u_wavesegments: {type: "v2", value: new THREE.Vector2(40, 40)}
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

	window.water = new THREE.Object3D();
	var wsize = uniforms.u_wavesize.value;
	var wseg = uniforms.u_wavesegments.value;
	water.add(new THREE.Mesh(new THREE.PlaneGeometry(wsize.x, wsize.y, wseg.x, wseg.y), waveShaderMaterial));
	water.add(new THREE.Mesh(new THREE.PlaneGeometry(wsize.x, wsize.y, wseg.x, wseg.y), wireShaderMaterial));
	water.add(new THREE.Mesh(new THREE.PlaneBufferGeometry(wsize.x, wsize.y), faceMaterial));
	water.rotation.x = Math.PI / 2;
	scene.add(water);

	var rockGeometry = new THREE.IcosahedronGeometry(20, 2);
	var rockMaterial = new THREE.MeshPhongMaterial({color: 0x666666, shininess: 0, shading: THREE.FlatShading});
	for(var i = 0; i < rockGeometry.vertices.length; i++) {
		rockGeometry.vertices[i].x += Math.random() * 3 - 1.5;
		rockGeometry.vertices[i].y = Math.max(Math.min(rockGeometry.vertices[i].y + Math.random() * 3 - 1.5, 18), 0);
		rockGeometry.vertices[i].z += Math.random() * 3 - 1.5;
	}
	window.rock = new THREE.Mesh(rockGeometry, rockMaterial);
	rock.position.set(15, 0, -7);
	scene.add(rock);

	var lhWhite = new THREE.MeshPhongMaterial({color: 0xddddaa, shininess: 10, shading: THREE.FlatShading});
	var lhRed = new THREE.MeshPhongMaterial({color: 0xef5350, shininess: 10, shading: THREE.FlatShading});
	var lhBlack = new THREE.MeshPhongMaterial({color: 0x444444, shininess: 10, shading: THREE.FlatShading});
	window.lighthouseOn = false;
	window.lighthouse = new THREE.Object3D();
	lighthouse.add(new THREE.Mesh(new THREE.CylinderBufferGeometry(5, 6, 6), lhRed));
	lighthouse.children[0].position.y = 20;
	lighthouse.add(new THREE.Mesh(new THREE.CylinderBufferGeometry(4, 5, 6), lhWhite));
	lighthouse.children[1].position.y = 26;
	lighthouse.add(new THREE.Mesh(new THREE.CylinderBufferGeometry(3, 4, 6), lhRed));
	lighthouse.children[2].position.y = 32;

	lighthouse.add(new THREE.Object3D());
	lighthouse.children[3].position.y = 40;
	var lhBase = new THREE.Mesh(new THREE.CylinderBufferGeometry(4, 4, 1), lhBlack);
	lhBase.position.y = -5;
	var lhGlass = new THREE.Mesh(new THREE.CylinderBufferGeometry(3, 3, 3.5, 8, 1, true), new THREE.MeshPhongMaterial({transparent: true, opacity: 0.1, color: 0x000000, shininess: 1000, shading: THREE.FlatShading, side: THREE.DoubleSide}));
	lhGlass.add(new THREE.LineSegments(new THREE.EdgesGeometry(lhGlass.geometry), new THREE.LineBasicMaterial({color: 0x444444})));
	lhGlass.position.y = -2.75;
	var lhRoof = new THREE.Mesh(new THREE.CylinderBufferGeometry(1, 4, 2), lhBlack);
	var lhRoofBall = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(0.7, 1), lhBlack);
	lhRoofBall.position.y = 1.3;
	var lhSpire = new THREE.Mesh(new THREE.BoxBufferGeometry(0.25, 2, 0.25), lhBlack);
	lhSpire.position.y = 2.7;

	lighthouse.children[3].add(lhBase);
	lighthouse.children[3].add(lhGlass);
	lighthouse.children[3].add(lhRoof);
	lighthouse.children[3].add(lhRoofBall);
	lighthouse.children[3].add(lhSpire);

	lighthouse.add(new THREE.Object3D());
	lighthouse.rotationCounter = -2;
	lighthouse.children[4].position.y = 37;
	var lhLightFixture = new THREE.Mesh(new THREE.ConeGeometry(1, 1), new THREE.MultiMaterial([lhBlack, new THREE.MeshPhongMaterial({emissive: 0xffffbb, shading: THREE.FlatShading})]));
	for(var i = 0; i < lhLightFixture.geometry.faces.length; i++) {
		lhLightFixture.geometry.faces[i].materialIndex = i < 8 ? 0 : 1;
	}
	lhLightFixture.position.z = -1;
	lhLightFixture.rotation.x = -Math.PI / 2;
	var lightShaderMaterial = new THREE.ShaderMaterial({
		transparent: true,
		uniforms: uniforms,
		vertexShader: document.getElementById("beamVertexShader").textContent,
		fragmentShader: document.getElementById("beamFragmentShader").textContent,
		side: THREE.DoubleSide
	});
	var lhLightBeam = new THREE.Mesh(new THREE.CylinderGeometry(1, 15, wsize.x / 1.8, 16, 1, true), lightShaderMaterial);
	lhLightBeam.position.z = wsize.x / 3.6 - 0.5;
	lhLightBeam.rotation.x = -Math.PI / 2;
	lighthouse.children[4].add(lhLightFixture);
	lighthouse.children[4].add(lhLightBeam);
	lighthouse.children[4].position.x = Math.sin(lighthouse.rotationCounter);
	lighthouse.children[4].position.z = Math.cos(lighthouse.rotationCounter);
	lighthouse.children[4].rotation.y = lighthouse.rotationCounter;

	lighthouse.position.x = 15;
	lighthouse.position.z = -5;
	scene.add(lighthouse);

	window.lhSpotLight = new THREE.SpotLight(0xffffaa, uniforms.u_intensity.value, 0, 0.5, 1);
	lhSpotLight.position.set(15, 37.4, -5);
	lhSpotLight.target = lighthouse.children[4];
	scene.add(lhSpotLight);

	render();
	if(Cookies.get("animated")) {
		uniforms.u_multiplier.value = 1;
		$("#overlay").addClass("in");
		camera.position.set(70, 60, 190);
		camera.lookAt(scene.position);
		toggleLight();
	}
	else {
		scene.scale.set(0.01, 1, 0.01);
		lighthouse.scale.y = -0.01;
		rock.scale.y = -0.01;
		TweenLite.to(scene.scale, 0.75, {x: 1});
		TweenLite.to(camera.position, 1, {x: 70, y: 60, z: 190, onUpdate: function() {camera.lookAt(scene.position);}, delay: 1});
		TweenLite.to(controls.target, 1, {x: 0, y: 0, z: 0, delay: 1});
		TweenLite.to(camera.up, 0.75, {x: 0, y: 1, z: 0, delay: 1});
		TweenLite.to(scene.scale, 0.75, {z: 1, delay: 1});
		TweenLite.to(uniforms.u_multiplier, 2, {value: 1, ease: Expo.easeOut, delay: 2});
		TweenLite.to(lighthouse.scale, 1.5, {y: 1, ease: Expo.easeOut, delay: 2});
		TweenLite.to(rock.scale, 1.5, {y: 1, ease: Expo.easeOut, delay: 2});
		setTimeout(function() {
			$("#overlay").addClass("in");
			Cookies.set("animated", true, {path: "", expires: 1 / 144});
			toggleLight();
		}, 3500);
	}

	function toggleNight() {
		TweenLite.to(uniforms.u_multiplier, 5, {value: 3});
		TweenLite.to(pointlight, 5, {intensity: 0.6});
		TweenLite.to(ambient.color, 5, {r: 0.2, g: 0.13, b: 0.1});
	}

	function toggleLight() {
		if(lighthouseOn) {
			TweenLite.to(uniforms.u_intensity, 2, {value: 0, onUpdate: function() {lhSpotLight.intensity = uniforms.u_intensity.value;}, onComplete: function() {lighthouseOn = false;}});
		}
		else {
			lighthouseOn = true;
			TweenLite.to(uniforms.u_intensity, 2, {value: 1, onUpdate: function() {lhSpotLight.intensity = uniforms.u_intensity.value;}});
		}
	}

	function render() {
		requestAnimFrame(render);
		renderer.render(scene, camera);
		controls.update();

		var delta = clock.getDelta();
		uniforms.u_time.value += delta;
		if(lighthouseOn) {
			lighthouse.rotationCounter += delta;
			var c = lighthouse.rotationCounter;
			lighthouse.children[4].position.x = Math.sin(c);
			lighthouse.children[4].position.z = Math.cos(c);
			lighthouse.children[4].rotation.y = c;
		}
	}

	$(window).resize(function(e) {
		width = $("#rendererContainer").width();
		height = Math.min(width, $("#rendererContainer").height());
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	});
});