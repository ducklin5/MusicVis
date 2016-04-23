/*global p5 */
var s = function (p) {
    'use strict';
	var song, fft;
	
	p.preload = function () {
		song = p.loadSound('Alan.mp3');
	};

	p.setup = function () {
		p.createCanvas(1000, 400);
		p.noFill();
		song.play();
		fft = new p5.FFT();
		fft.setInput(song);
	};

	p.draw = function () {
		p.background(200, 100, 155);

		var i, waveform = fft.waveform(), spectrum = fft.analyze(), bigRad = (p.height / 2) + fft.getEnergy("bass") / 5;
		
		p.noFill();
		
		p.fill(51, 200, 255);
		p.ellipse(p.width / 2, p.height / 2, bigRad, bigRad);
		

	};
};
var myp5 = new p5(s);
