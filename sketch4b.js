/*global p5 */
var s = function (p) {
    'use strict';
	var fft, filter, mic, waveform, spectrum,
		frame = 0;
	p.preload = function () {
		bg = p.loadImage('bg0.jpg')
		//song = p.loadSound('Alan.mp3');
	};

	p.setup = function () {
		
		p.createCanvas(p.windowWidth, p.windowHeight);
		mic = new p5.AudioIn();
		//create a filter to remove noise
		filter = new p5.Filter();
		//frameRate(20);
		//initiate the mic and add the filter
		// disconnect unfiltered noise,
		mic.disconnect();
		// and connect to filter
		mic.connect(filter);
		mic.start();
		// Create the fft variable and set the input
		fft = new p5.FFT(0.1, 8192);
		fft.setInput(filter);
	};


	p.draw = function () {
		filter.setType('bandpass');
	//filter.freq(40);
	filter.res(60);
	fft.analyze();
		p.background(255);
		p.beginShape();
		p.stroke('#D8D8D8'); // waveform is yellow
		p.strokeWeight(3);
		for ( var i = 0; i <= 2000; i+= 5 ){
			p.curveVertex(p.map(i,0,2000, 0, p.windowWidth ), p.windowHeight - p.map(fft.getEnergy(i), 0, 255,0,p.windowHeight));
		}
		console.log(p.map(p.mouseX,0,p.windowWidth,0,2000));
		p.endShape();
		for(var i = 0; i <= 255; i+=25.5 ){
			p.beginShape();
			p.line(0, p.windowHeight - i * p.windowHeight/255,p.windowWidth, p.windowHeight - i * p.windowHeight/255);
			p.endShape();
		}
		p.beginShape();
		p.line(p.map(500,0,2000, 0, p.windowWidth ), p.height -	p.map(50, 0, 255,0,p.windowHeight), p.map(1000,0,2000, 0, p.windowWidth ), p.height - p.map(20, 0, 255,0,p.windowHeight));
		p.endShape();
		

	};
};
var myp5 = new p5(s);
