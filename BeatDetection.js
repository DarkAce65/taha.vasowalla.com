function getPeaksAtThreshold(data, threshold) {
	var peaksArray = [];
	var length = data.length;
	for(var i = 0; i < length; i += 10000) {
		if(data[i] > threshold) {
			peaksArray.push(i);
		}
		i++;
	}
	return peaksArray;
}

function countIntervalsBetweenNearbyPeaks(peaks) {
	var intervalCounts = [];
	peaks.forEach(function(peak, index) {
		for(var i = 1; i < 10; i++) {
			var interval = peaks[index + i] - peak;
			var foundInterval = intervalCounts.some(function(intervalCount) {
				if(intervalCount.interval === interval) return intervalCount.count++;
			});
			if(!foundInterval && !isNaN(interval)) {
				intervalCounts.push({
					interval: interval,
					count: 1
				});
			}
		}
	});
	return intervalCounts;
}

function groupNeighborsByTempo(intervalCounts) {
	var tempoCounts = [];
	intervalCounts.forEach(function(intervalCount, i) {
		var theoreticalTempo = 60 / (intervalCount.interval / 44100);

		// Adjust the tempo to fit within the 90-180 BPM range
		while(theoreticalTempo < 90) {
			theoreticalTempo *= 2;
		}
		while(theoreticalTempo > 180) {
			theoreticalTempo /= 2;
		}

		var foundTempo = tempoCounts.some(function(tempoCount) {
			if(tempoCount.tempo === theoreticalTempo) return tempoCount.count += intervalCount.count;
		});
		if(!foundTempo) {
			tempoCounts.push({
				tempo: theoreticalTempo,
				count: intervalCount.count
			});
		}
	});
	return tempoCounts;
}

function getBPM(buffer) {
	var peaksArray = [], intervalCounts = [], tempoCounts = [];
	var offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
	var beatSource = offlineContext.createBufferSource();
	beatSource.buffer = buffer;

	var beatFilter = offlineContext.createBiquadFilter();
	beatFilter.type = "lowpass";
	beatSource.connect(beatFilter);
	beatFilter.connect(offlineContext.destination);
	beatSource.start(0);

	offlineContext.startRendering();
	offlineContext.oncomplete = function(e) {
		var filteredBuffer = e.renderedBuffer;
		var i = 1;
		while(peaksArray.length < 10) {
			i -= 0.05;
			peaksArray = getPeaksAtThreshold(filteredBuffer.getChannelData(0), i);
		}
		intervalCounts = countIntervalsBetweenNearbyPeaks(peaksArray);
		tempoCounts = groupNeighborsByTempo(intervalCounts);
		tempoCounts.sort(function(a, b) {
			return b.count - a.count;
		});
		bpm = tempoCounts[0].tempo;
	};
}

var bpm = 0;