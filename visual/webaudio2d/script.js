"use strict";

var mobile = false, filename = "";
var c, ctx, cWidth = 2049, cHeight = 1245, audioCtx, arrayBuffer, source, gainNode, analyser, lastToast;
var targetVolume = 0, currentVolume = 0, volDecay = 0.1, startOffset = 0, startTime = 0;
var bufferLength, volumeData, frequencyData;
var playing = false, canvasReady = false, wavesurferReady = false;
var wavesurfer = Object.create(WaveSurfer);

function lerp(a, b, t) {
	return a + t * (b - a);
}

function mobileTest() {
	var check = false;
	(function(a){
		if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) {
			check = true;
		}
	})(navigator.userAgent || navigator.vendor || window.opera);

	return check;
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
			canvasReady = false;
			wavesurferReady = false;
			if(!mobile) {
				wavesurfer.loadBlob(files[0]);
				$("#wave").hide(250);
			}
			audioCtx.decodeAudioData(e.target.result, function(buffer) {
				filename = files[0].name;
				arrayBuffer = buffer;
				if(mobile) {
					reset();
					toastr.clear(lastToast);
					toastr.success("Audio data decoded!");
					play();
				}
				else if(wavesurferReady) {
					reset();
					$("#wave").show(250);
					toastr.clear(lastToast);
					toastr.success("Audio data decoded!");
					play();
				}
				else {
					canvasReady = true;
				}
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
		document.getElementById("currentTime").innerHTML = "-:--";
		document.getElementById("duration").innerHTML = "-:--";
		source = undefined;
	}
	$("#upload").val(null);
	$("#playPause").attr("disabled", true);
	playing = false;
	startOffset = 0;
	targetVolume = 0;
	currentVolume = 0;
	ctx.clearRect(0, 0, cWidth, cHeight);
	ctx.fillStyle = "hsl(0, 67%, 20%)";
	ctx.fillRect(0, 1199, cWidth, 1);
}

function pause() {
	if(source) {
		source.stop();
		startOffset += audioCtx.currentTime - startTime;
		if(!mobile) {wavesurfer.pause();}
		playing = false;
		$("#playPause i").removeClass("fa-pause");
		$("#playPause i").addClass("fa-play");
	}
}

function play() {
	if(arrayBuffer) {
		startTime = audioCtx.currentTime;
		source = audioCtx.createBufferSource();
		playing = true;
		source.buffer = arrayBuffer;
		source.connect(gainNode);
		gainNode.connect(analyser);
		analyser.connect(audioCtx.destination);
		source.start(0, startOffset % arrayBuffer.duration);
		bufferLength = analyser.frequencyBinCount;
		volumeData = new Uint8Array(bufferLength);
		frequencyData = new Uint8Array(bufferLength);
		if(!mobile) {
			wavesurfer.seekAndCenter(startOffset / arrayBuffer.duration);
			wavesurfer.play();
		}
		draw();
		$("#playPause, #upload, .btn-file").attr("disabled", false);
		document.getElementById("duration").innerHTML = toHHMMSS(arrayBuffer.duration);
		document.getElementById("fileName").innerHTML = filename + " - ";
		$("#playPause i").removeClass("fa-play");
		$("#playPause i").addClass("fa-pause");
	}
}

function draw() {
	analyser.getByteTimeDomainData(volumeData);
	analyser.getByteFrequencyData(frequencyData);
	ctx.clearRect(0, 0, cWidth, cHeight);
	var fx = 0;
	var fxInc = cWidth / 683;
	targetVolume = 0;
	for(var i = 0; i < bufferLength; i++) {
		var v = volumeData[i] - 128;
		targetVolume += v * v;

		var delta = 10000 / (i + 80) - 13;
		var y = Math.max(0.64 / 3, frequencyData[i] - delta) / 256;
		ctx.fillStyle = "hsl(0, 67%, " + Math.min(100, Math.pow(266.97, y + 0.034473) + 20) + "%)";
		ctx.fillRect(fx, (1 - y) * 1200, fxInc, y * 1200);
		fx += fxInc;
	}
	targetVolume = Math.sqrt(targetVolume / bufferLength) / 85;
	if(currentVolume < targetVolume) {
		currentVolume = targetVolume;
	}
	else {
		currentVolume = lerp(currentVolume, targetVolume, volDecay);
	}
	if(currentVolume > 1) {
		currentVolume = 1;
	}
	ctx.fillStyle = "#fff";
	ctx.fillRect(10, 1210, currentVolume * (cWidth - 20), 25);
	if(playing) {
		document.getElementById("currentTime").innerHTML = toHHMMSS(audioCtx.currentTime - startTime + startOffset);
		if(audioCtx.currentTime - startTime + startOffset >= arrayBuffer.duration) {
			playing = false;
			reset();
		}
		else {
			requestAnimFrame(draw);
		}
	}
}

$(function() {
	window.requestAnimFrame =
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};

	c = document.getElementById("visualizer");
	ctx = c.getContext("2d");
	c.height = cHeight;
	c.width = cWidth;
	ctx.fillStyle = "#0F0";
	ctx.font = "16px serif";
	toastr.options = {"positionClass": "toast-bottom-right", "showMethod": "slideDown", "hideMethod": "slideUp"};
	reset();
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	mobile = mobileTest();
	audioCtx = new AudioContext();
	gainNode = audioCtx.createGain();
	analyser = audioCtx.createAnalyser();
	analyser.smoothingTimeConstant = 0.8;
	wavesurfer.init({
		container: "#wave",
		audioContext: audioCtx,
		interact: false,
		normalize: true,
		scrollParent: true,
		hideScrollbar: true,
		height: 100,
		progressColor: "#ef5350",
		waveColor: "#632828",
		cursorColor: "#fff"
	});
	wavesurfer.toggleMute();
	wavesurfer.on("ready", function() {
		if(canvasReady) {
			reset();
			$("#wave").show(250);
			toastr.clear(lastToast);
			toastr.success("Audio data decoded!");
			play();
		}
		else {
			wavesurferReady = true;
		}
	});
	$("#wave").hide();

	$(window).resize(function() {
		c.height = cHeight;
		c.width = cWidth;
		ctx = c.getContext("2d");
		ctx.fillStyle = "#0F0";
		ctx.font = "16px serif";
	});

	$(window).keyup(function(e) {
		if(e.which == 27) {
			$("body").removeClass("fullscreen");
			$("#fullscreen i").removeClass("fa-compress");
			$("#fullscreen i").addClass("fa-expand");
		}
	});

	$("#playPause").click(function() {
		if($("#playPause i").hasClass("fa-pause")) {
			pause();
		}
		else {
			play();
		}
	});

	$("#fullscreen").click(function() {
		$("body").toggleClass("fullscreen");
		$("#fullscreen i").toggleClass("fa-expand fa-compress");
	});
});