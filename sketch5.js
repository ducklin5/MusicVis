/*global p5 */
var s = function (p) {
    'use strict';
	var bg, pg, bg0, cImage, mic, fft, spectrum;
	//
	p.preload = function () {
		bg0 = p.loadImage('bg0.jpg');
		cImage = p.loadImage('Owl_Circle3.png');
		//song = p.loadSound('Alan.mp3');
	};

	p.setup = function () {
		p.createCanvas(p.windowWidth, p.windowHeight);
		p.frameRate(15);
		p.background('#ecf0f1');
		bg = p.createGraphics(p.windowWidth, p.windowHeight);
		p.bgShapes();
		pg = bg.get();
		pg.filter(p.INVERT);
		pg.filter("BLUR", 7);
		mic = new p5.AudioIn();
		mic.start();
		fft = new p5.FFT();
		fft.setInput(mic);
	};

	p.draw = function () {
		p.background(pg);
		p.imageMode('center');
		p.image(cImage, p.windowWidth / 2, p.windowHeight / 2);
		spectrum = fft.analyze();
		var i, j = 16, x, h, avg;
		for (i = 416; i <= 1024; i += 1){
			spectrum[i] = 0;
		}
		for (i = 0; i < spectrum.length; i += 32) {
			avg = (spectrum[i] + spectrum[i + j] + spectrum[i + 2 * j] + spectrum[i + 3 * j] + spectrum[i + 4 * j]) / 5 ;
			x = p.map(i, 0, spectrum.length, 0, p.width);;
			h = (-p.height + p.map(avg, 0, 255, p.height, 0));
			p.rect(x, p.height, p.width * 32 / spectrum.length, h);
		}
	};

	p.bgShapes = function () {
		var alpha, i, x, y;
		bg.background('#ecf0f1');
		for (i = 0; i < 100; i += 1) {
			x = p.windowWidth / 2 + (i * i);
			y = p.windowHeight / 2 + (i * i);
			alpha = 125 - (i * i) / 10;
			bg.noStroke();
			bg.fill(10, 10, 10, alpha);
			bg.ellipse(p.windowWidth / 2, p.windowHeight / 2, x, y);
		}
	};
};
var myp5 = new p5(s);
