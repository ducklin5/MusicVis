/*global p5 */
var s = function (p) {
    'use strict';
	var bg,
		song, fft, mic,
		button, input = "mic",
		i, waveform, spectrum, C1r, C2r, C3r, noisex = 0.0, Cxoff = 0,
		frame = 0;
	p.preload = function () {
		bg = p.loadImage('bg0.jpg')
		//song = p.loadSound('Alan.mp3');
	};

	p.setup = function () {
		p.frameRate(40);
		p.createCanvas(p.windowWidth, p.windowHeight);
		button = p.createButton('Input');
		button.position(p.windowWidth - 100, 19);
		button.mousePressed(p.changeInput);
		
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
		p.background(bg);
		if (p.windowWidth >  p.windowHeight) {
			radAxis = 3 * p.windowHeight / 4;
		} else {
			radAxis = 3 * p.windowWidth / 4;
		}

		waveform = fft.waveform();
		spectrum = fft.analyze();
		C1r = p.map(fft.getEnergy("bass"), 0, 255, radAxis/2, radAxis);
		C2r = p.map(fft.getEnergy("mid"), 0, 255, radAxis/2, radAxis);
		C3r = p.map(fft.getEnergy("treble"), 0, 255, radAxis/2, radAxis);

		p.noFill();
		p.beginShape();
		p.stroke('#D8D8D8'); // waveform is yellow
		p.strokeWeight(3);
		for (i = -32; i < waveform.length; i += 32) {
			var x = p.map(i, 0, waveform.length / 2, 0, p.windowWidth);
			var y =  (0.5 * p.windowHeight) + p.map(waveform[i], -1, +1, p.height / 4, -p.height / 4);
			p.curveVertex(x, y);
		}

		p.endShape();

		// generate vibration offset
		if (fft.getEnergy('bass') > 180){
			noisex += 0.8;
			Cxoff = p.noise(noisex) * radAxis * fft.getEnergy("bass")/2500;
		}
		
		p.stroke(255); // energy cirlce border color white
		p.strokeWeight(1);

		//Draw EnergyCircles
		p.fill('#4ca0ff');
		p.ellipse(p.width / 2, p.height / 2, C1r + Cxoff, C1r + Cxoff);
		p.fill(200, 51, 255);
		p.ellipse(p.width / 2, p.height / 2, C2r, C2r);
		p.fill('#3F3F78');
		p.ellipse(p.width / 2, p.height / 2, C3r, C3r);
		p.fill('#666')
		p.ellipse(p.width / 2, p.height / 2, radAxis/2 , radAxis/2)

	};
	p.changeInput = function () {
		if (input === "song") {
			input = "mic";
			song.stop();
			p.setup();
			
		} else if (input === "mic") {
			input = "song";
			p.setup();
		}

	};
};
var myp5 = new p5(s);
