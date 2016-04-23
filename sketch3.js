/*global p5 */
var s = function (p) {
    'use strict';
	var song, fft, mic, input = "mic";
	p.preload = function () {
		song = p.loadSound('Alan.mp3');
	};

	p.setup = function () {
		p.createCanvas(p.windowWidth, p.windowHeight);
		
		if (input === "song") {
			song.play();
			fft = new p5.FFT();
			fft.setInput(song);
		} else if (input === "mic") {
			mic = new p5.AudioIn();
			mic.start();
			fft = new p5.FFT();
			fft.setInput(mic);
		}
	};
	p.windowResized = function () {
		p.resizeCanvas(p.windowWidth, p.windowHeight);
	};

	p.draw = function () {
		var radAxis;
		p.background('#1E1F26');
		if (p.windowWidth >  p.windowHeight) {
			radAxis = 2 * p.windowHeight / 3;
		} else {
			radAxis = 2 * p.windowWidth / 3;
		}
		var i,
			waveform = fft.waveform(),
			spectrum = fft.analyze(),
			C1r = p.map(fft.getEnergy("bass", "lowMid"), 0, 255, 0, radAxis),
			C2r = p.map(fft.getEnergy("mid"), 0, 255, 0, radAxis),
			C3r = p.map(fft.getEnergy("treble"), 0, 255, 0, radAxis);
		
		p.noFill();
		p.beginShape();
		p.stroke(200, 255, 51); // waveform is yellow
		p.strokeWeight(3);
		for (i = -32; i < waveform.length; i += 32) {
			var x = p.map(i, 0, waveform.length / 2, 0, p.windowWidth);
			var y =  (0.5 * p.windowHeight) + p.map(waveform[i], -1, +1, p.height / 4, -p.height / 4);
			p.curveVertex(x, y);
		}
		p.endShape();
				
		p.stroke(255); // waveform is yellow
		p.strokeWeight(1);
		
		p.fill('#4ca0ff');
		p.ellipse(p.width / 2, p.height / 2, C1r, C1r);
		p.fill(200, 51, 255);
		p.ellipse(p.width / 2, p.height / 2, C2r, C2r);
		p.fill('#f9ba44');
		p.ellipse(p.width / 2, p.height / 2, C3r, C3r);

	};
};
var myp5 = new p5(s);
