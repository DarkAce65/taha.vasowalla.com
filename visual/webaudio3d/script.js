window.requestAnimFrame =
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};

function lerp(a, b, t) {
	return a + t * (b - a);
}

function toHHMMSS(number) {
	var date = new Date(0, 0, 0);
	date.setSeconds(Math.round(number));
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();

	if(hours === 0) {hours = "";}
	else if(minutes < 10) {hours += ":0";}
	else {hours += ":";}

	if(seconds < 10) {seconds = "0" + seconds;}

	var time = hours + minutes + ":" + seconds;
	return time;
}

$(function() {
	function createLines(resolution) {
		for(var i = 0; i < lines.length; i++) {
			scene.remove(lines[i]);
		}
		scene.remove(circle);

		lines = [];
		var vertices = [];
		var curve = new THREE.EllipseCurve(0, 0, 100, 100, 2 * Math.PI, 0, true);
		curve.getPoints(resolution - 1).map(function(v, i) {
			vertices[i] = v.toArray();
		});

		positions = new Float32Array(resolution * 3);
		var geometry = new THREE.BufferGeometry();
		var material = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors});
		var colors = new Float32Array(resolution * 3);
		for(var i = 0; i < vertices.length; i ++) {
			var x = vertices[i][0];
			var y = vertices[i][1];
			var z = 0;
			var color = new THREE.Color().setHSL(i / resolution, 1, 0.5);
			positions[i * 3] = x;
			positions[i * 3 + 1] = y;
			positions[i * 3 + 2] = z;
			colors[i * 3] = color.r;
			colors[i * 3 + 1] = color.g;
			colors[i * 3 + 2] = color.b;
		}
		geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
		geometry.addAttribute("color", new THREE.BufferAttribute(colors, 3));
		geometry.computeBoundingSphere();
		circle = new THREE.Line(geometry, material);
		scene.add(circle);

		for(var i = 0; i < resolution; i++) {
			var geometry = new THREE.Geometry();
			var vertex = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], 0);
			vertex.z = positions[i * 3 + 2];
			var vertex2 = vertex.clone();
			geometry.vertices.push(vertex, vertex2);
			var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: new THREE.Color().setHSL(i / resolution, 1, 0.5)}));
			geometry.verticesNeedUpdate = true;
			lines.push(line);
			scene.add(line);
		}
	}

	function toggleQuality() {
		if(document.querySelector("#resCheckbox").checked) {
			createLines(500);
			$('label[for="resCheckbox"]').html("Quality: High");
		}
		else {
			createLines(200);
			$('label[for="resCheckbox"]').html("Quality: Low");
		}
	}

	function toggleRotation() {
		if(document.querySelector("#rotationCheckbox").checked) {
			rotate = true;
			$('label[for="rotationCheckbox"]').html("Rotation: On");
			$('label[for="rotationCheckbox"]').addClass("active");
		}
		else {
			rotate = false;
			$('label[for="rotationCheckbox"]').html("Rotation: Off");
			$('label[for="rotationCheckbox"]').removeClass("active");
		}
	}

	function resetRotation() {
		var tau = 2 * Math.PI;
		var sR = Math.round(scene.rotation.z / tau) * tau;
		var vR = Math.round(volumeObject.rotation.z / tau) * tau;
		TweenLite.to(scene.rotation, 2, {z: sR});
		TweenLite.to(volumeObject.rotation, 2, {z: vR});
	}

	function setCamera(position) {
		if(position) {
			currentCamera = position;
		}
		if(!rotate) {
			resetRotation();
		}

		var x = 0, y = 0, z = 0, uz = 0;

		$("#currentCamera").html(currentCamera);

		switch(currentCamera) {
			case "Overhead":
				x = 0;
				y = 0;
				z = 300;
				uz = 0;
				break;
			case "Side":
			default:
				x = 116;
				y = -200;
				z = 200;
				uz = 1;
				break;
		}

		x *= factor;
		y *= factor;
		z *= factor;

		TweenLite.to(camera.position, 2, {x: x, y: y, z: z, ease: Power2.easeInOut});
		TweenLite.to(controls.target, 2, {x: 0, y: 0, z: 0, ease: Power2.easeOut, onUpdate: function(){camera.lookAt(controls.target);}});
		TweenLite.to(camera.up, 1, {x: 0, y: 1, z: uz});
	}

	function fileUpload(files) {
		if(files.length !== 0) {
			$("#playPause, #upload, .btn-file").attr("disabled", true);
			var reader = new FileReader();
			reader.onload = function(e) {
				toastr.options.timeOut = 5000;
				toastr.options.extendedTimeOut = 1000;
				toastr.success(files[0].name + " uploaded!");
				toastr.options.timeOut = 0;
				toastr.options.extendedTimeOut = 0;
				lastToast = toastr.info("Decoding audio data...");
				toastr.options.timeOut = 5000;
				toastr.options.extendedTimeOut = 1000;
				audioCtx.decodeAudioData(e.target.result, function(buffer) {
					fileName = files[0].name;
					arrayBuffer = buffer;
					reset();
					emptySource = false;
					toastr.clear(lastToast);
					toastr.success("Audio data decoded!");
					play();
					setCamera("Side");
				},
				function() {
					toastr.clear(lastToast);
					toastr.error("Decoding error. Make sure the file is an audio file.");
					$("#upload, .btn-file").attr("disabled", false);
				});
			};
			reader.readAsArrayBuffer(files[0]);
		}
	}

	function reset() {
		if(source) {
			source.disconnect();
			gainNode.disconnect();
			analyser.disconnect();
			source.stop();
			document.getElementById("fileName").innerHTML = "";
			currentTime.innerHTML = "-:--";
			document.getElementById("duration").innerHTML = "-:--";
			source = undefined;
		}
		$("#upload").val(null);
		$("#playPause").attr("disabled", true);
		playing = false;
		clock.stop();
		emptySource = true;
		startOffset = 0;
		volumeData = silence;
		frequencyData = new Uint8Array(analyser.frequencyBinCount);
	}

	function pause() {
		if(source) {
			playing = false;
			clock.stop();
			source.stop();
			startOffset += audioCtx.currentTime - startTime;
			$("#playPause i").removeClass("fa-pause");
			$("#playPause i").addClass("fa-play");
		}
	}

	function play() {
		if(arrayBuffer) {
			clock.start();
			startTime = audioCtx.currentTime;
			source = audioCtx.createBufferSource();
			source.buffer = arrayBuffer;
			source.connect(gainNode);
			gainNode.connect(analyser);
			analyser.connect(audioCtx.destination);
			source.start(0, startOffset % arrayBuffer.duration);
			playing = true;
			$("#playPause, #upload, .btn-file").attr("disabled", false);
			document.getElementById("duration").innerHTML = toHHMMSS(arrayBuffer.duration);
			document.getElementById("filename").innerHTML = fileName + " - ";
			$("#playPause i").removeClass("fa-play");
			$("#playPause i").addClass("fa-pause");
		}
	}

	function draw(frequencyData) {
		var targetVolume = 0.0001;
		for(var i = 0; i < lines.length; i++) {
			var dataIndex = Math.floor(i / lines.length * 683);
			var v = volumeData[dataIndex] - 128;
			targetVolume += v * v;
			var delta = 1575 / (dataIndex + 15) - 1;
			var scalar = (frequencyData[dataIndex] - delta) / 256 + 1;
			if(scalar < 1) {
				scalar = 1;
			}
			lines[i].geometry.vertices[1].x = scalar * positions[i * 3];
			lines[i].geometry.vertices[1].y = scalar * positions[i * 3 + 1];
			lines[i].geometry.verticesNeedUpdate = true;
			//lines[i].material.color.setHSL(0, 0.67, Math.pow(11.762, scalar - 1.79) + 0.2);
		}
		targetVolume = Math.sqrt(targetVolume / lines.length) / 85;
		if(currentVolume < targetVolume) {
			currentVolume = targetVolume;
		}
		else {
			currentVolume = lerp(currentVolume, targetVolume, volDecay);
		}
		if(currentVolume < 0.0001) {
			currentVolume = 0.0001;
		}
		else if(currentVolume > 1) {
			currentVolume = 1;
		}
		volumeObject.scale.set(currentVolume, currentVolume, currentVolume);
		volumeObject.children[0].material.color.setHSL(0, 0.67, currentVolume + 0.1);
		volumeObject.children[1].material.color.setHSL(0, 0.67, 1.1 - currentVolume);
		if(playing) {
			currentTime.innerHTML = toHHMMSS(audioCtx.currentTime - startTime + startOffset);
			progressBar.width((audioCtx.currentTime - startTime + startOffset) / arrayBuffer.duration * 100 + "%");
		}
	}

	function render() {
		var delta = clock.getDelta();
		if(emptySource) {
			volumeData = silence;
			draw(zeroArray);
		}
		else {
			analyser.getByteTimeDomainData(volumeData);
			analyser.getByteFrequencyData(frequencyData);
			draw(frequencyData);
			if(playing && audioCtx.currentTime - startTime + startOffset >= arrayBuffer.duration) {
				reset();
			}
		}

		if(playing && rotate) {
			volumeObject.rotation.z += 0.4 * delta;
			scene.rotation.z -= 0.2 * delta;
		}
		requestAnimFrame(render);
		renderer.render(scene, camera);
		controls.update();
	}

	var currentCamera = "Overhead";

	var currentTime = document.querySelector("#currentTime");
	var progressBar = $(".progress-bar");

	var resToast, lastToast;
	var playing = false;
	var rotate = false;
	var currentVolume = 0.0001;
	var volDecay = 0.1;
	var circle;
	var lines = [];
	var positions = [];
	var factor = window.innerWidth < 768 ? 1.5 : 1;

	toastr.options = {"positionClass": "toast-bottom-right", "showMethod": "slideDown", "hideMethod": "slideUp"};

	var clock = new THREE.Clock();
	var scene = new THREE.Scene();
	var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
	$("#rendererContainer").append(renderer.domElement);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x000000);
	renderer.setPixelRatio(window.devicePixelRatio);

	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
	camera.position.set(0, 0, 200 * factor);

	var controls = new THREE.TrackballControls(camera, renderer.domElement);

	var hemisphereLight = new THREE.HemisphereLight(0xccbbbb, 0xffbbee);
	scene.add(hemisphereLight);

	var volumeObject = new THREE.Object3D();
	var geometry = new THREE.IcosahedronGeometry(80);
	var material = new THREE.MeshPhongMaterial({color: 0xd9534f, side: THREE.DoubleSide, shading: THREE.FlatShading});
	var lineMaterial =  new THREE.LineBasicMaterial({color: 0xe3807d});
	volumeObject.add(new THREE.Mesh(geometry, material));
	volumeObject.add(new THREE.LineSegments(new THREE.WireframeGeometry(geometry), lineMaterial));
	scene.add(volumeObject);

	var audioCtx, arrayBuffer, source, gainNode, analyser;
	var startTime = 0, startOffset = 0, emptySource = true;
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	audioCtx = new AudioContext();
	gainNode = audioCtx.createGain();
	analyser = audioCtx.createAnalyser();
	analyser.fftSize = 4096;
	analyser.smoothingTimeConstant = 0.675;
	var volumeData = new Uint8Array(analyser.frequencyBinCount);
	var frequencyData = new Uint8Array(analyser.frequencyBinCount);

	var zeroArray = new Uint8Array(analyser.frequencyBinCount);
	var silence = new Uint8Array(analyser.frequencyBinCount);
	for(var i = 0; i < silence.length; i++) {
		silence[i] = 128;
	}

	createLines(200);
	reset();
	render();

	$(window).resize(function() {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		factor = window.innerWidth < 768 ? 1.5 : 1;
	});

	$("#upload").on("change", function(e) {
		fileUpload(e.target.files);
	});

	$("#playPause").click(function() {
		if($("#playPause i").hasClass("fa-pause")) {
			pause();
		}
		else {
			play();
		}
	});

	$("#overhead").click(function() {
		setCamera("Overhead");
	});

	$("#side").click(function() {
		setCamera("Side");
	});
	
	$("#resCheckbox").on("change", function(e) {
		toggleQuality();
	});
	
	$("#rotationCheckbox").on("change", function(e) {
		toggleRotation();
	});
});