/*global p5 */

var bg0, logo, mic, fft, filter, amplitude,
	system,
	spectrum, primary, secondary, tertiary, quaternary,
	logoComp, logoCnv,
	mirrorBg, bg, circleComp, circle,
	settings;
//

preload = function () {
	bg0 = loadImage('space-mountain.jpg');
	logo = loadImage('Owl_Circle2.png');
};

setup = function () {
	createCanvas(windowWidth, windowHeight);
	frameRate(60);
	
	settings = createDiv('Settings');
	settings.position(width-100,0);
	settings.height = height;
	
	//create a new filter
	filter = new p5.Filter();
	//create a microphone input, disconnect unfiltered sound, and connect to filter, then start mic
	mic = new p5.AudioIn();
	mic.disconnect();
	mic.connect(filter);
	mic.start();
	
	//fourier font transform the filtered sound
	fft = new p5.FFT(0.5, 8192);
	fft.setInput(filter);

	//get overall volume
	amplitude = new p5.Amplitude();
	amplitude.setInput(filter);

	//call all composites
	bg = mirrorBg(bg0);
	circleComp();
	logoComp(logo);
	
	//initialize spectrum and particle
	
	//primary = new polarSpectrum(25, 150, 15, PI, 0.2 * height - 10, 0.35 * height);
	//primary.thickness = 2;
	//primary.style = 'bars';
	//primary.draw(width / 2, height / 2);
	
	//secondary = new polarSpectrum(25, 150, 15, PI, 0.2 * height - 10, 0.4 * height);
	/*secondary.color = ["rainbow", 0.6, 0.9];
	secondary.thickness = 3;
	secondary.style = 'bars';
	tertiary.angleOffset = -0.03;*/
	
	tertiary = new polarSpectrum(25, 750, 100, PI, 0.2 * height - 10, 0.45 * height);
	tertiary.color = ["rainbow", 1, 0.85];
	tertiary.thickness = 5;
	tertiary.angleOffset = -0.06;
	tertiary.style = 'bars';
	
	/*quaternary = new polarSpectrum(25, 150, 15, PI, 0.2 * height - 10, 0.5 * height);
	quaternary.color = ["rainbow", 0.85, 0.8];
	quaternary.thickness = 0;
	quaternary.style = 'bars';*/
	
	system = new ParticleSystem(createVector(width / 2, height / 2));

};
draw = function () {
	push();

	//filter
	filter.setType('bandpass');
	//filter.freq(40);
	filter.res(10);

	//Set background
	background(bg.get());
	//background(bg0);

	//translate by sound
	var thePosX = fft.getEnergy('bass') * random(-0.05, 0.05);
	translate(thePosX, 0);

	//analyze and store the spectrum array
	spectrum = fft.analyze();

	//==Draw Particle System==//
	system.addParticle();
	system.run();

	//==Draw 4th Spectrum==//
	//quaternary.draw(width / 2, height / 2);
	

	//==Draw 3rd Spectrum==//
	tertiary.draw(width / 2, height / 2);


	//==Draw 2nd Spectrum==//
	//secondary.draw(width / 2, height / 2);

	//==Draw 1st Spectrum==//
	//primary.color = ["rainbow", 0.3, 1];

	translate(width / 2, height / 2);
	imageMode(CENTER);

	var theWidth = logoCnv.width + width * fft.getEnergy('bass') / 5000;
	//Show the "Circle" Layer
	//image(circle, 0, 0, theWidth, theWidth);

	//show the "Logo" layer from the logoComp
	image(logoCnv, 0, 0, theWidth, theWidth);

	pop();
};
mirrorBg = function (a) {
	var halfA = a.get(0, 0, a.width / 2, a.height);
	var out = createGraphics(width, height);
	out.background(a);
	out.scale(-1, 1);
	out.image(halfA, -width, 0, width / 2, height);
	return out.get();
};
logoComp = function (input) {
		logoCnv = createGraphics(0.4 * circle.height, 0.4 * circle.height);
		logoCnv.imageMode(CENTER);
		logoCnv.image(input, logoCnv.width / 2, logoCnv.height / 2, logoCnv.width - 30, logoCnv.width - 30);

	};
	//create the spectrum composite function
circleComp = function () {
	//save current setting, ie stroke, strokewight, fill, etc.
	push();
	//=============//
	//Circle LAYER//
	//===========//
	//create a graphic called "Circle" same size as the canvas
	circle = createGraphics(width, height);

	//create a graphic called "_circle" to later be put in "circle"
	//  0.4 times the size of the canvas
	var _circle = createGraphics(0.4 * circle.height, 0.4 * circle.height);
	_circle.noStroke();
	_circle.fill("#fff");
	_circle.ellipse(_circle.width / 2, _circle.height / 2, _circle.height - 30, _circle.height - 30);
	//draw the actual ellipse in "_circle" -- 30px smaller than "_circle"

	//create a copy of the "_circle" graphic and call it "glow"
	var glow = _circle.get();
	glow.filter(BLUR, 200);

	//Put "_circle" and "glow" in "Cirlce" then blend them
	circle.imageMode(CENTER);
	circle.image(_circle, circle.width / 2, circle.height / 2);
	circle.blendMode(ADD);
	circle.image(glow, circle.width / 2, circle.height / 2);

	pop();
}
var Spectrum = function (minFreq, maxFreq, increment) {
	this.minFreq = minFreq;
	this.maxFreq = maxFreq;
	this.increment = increment;
	this.smoothing = 10;
	this.isPolar = false;
	this.isLinear = true;
	this.style = 'curve';
	this.color = ["rainbow", 1, 1];
	this.thickness = 2;
}
var polarSpectrum = function (minFreq, maxFreq, increment, angle, minRadi, maxRadi) {
	Spectrum.call(this, minFreq, maxFreq, increment);
	this.angle = angle;
	this.minRadi = minRadi;
	this.maxRadi = maxRadi;
	this.mirror = true;
	this.isPolar = true;
	this.crdnts1 = [];
	this.crdnts2 = [];
}
polarSpectrum.prototype = Object.create(Spectrum.prototype);
polarSpectrum.prototype.constructor = Spectrum;

polarSpectrum.prototype.getPoints = function (xpos, ypos) {
	var theta, q = this.smoothing,
		r1, r2, x1, y1, x2, y2;
	this.crdnts1 = [];
	this.crdnts2 = [];
	for (var i = this.minFreq; i <= this.maxFreq; i += this.increment) {
		//define angle between lines
		theta = map(i, this.minFreq, this.maxFreq, 0, -this.angle) - PI/2 ;

		r1 = this.minRadi;
		x1 = r1 * cos(theta);
		y1 = r1 * sin(theta);


		r2 = this.minRadi + map(fft.getEnergy(i - q, i + q), 0, 255, 0, this.maxRadi - this.minRadi) + 1;
		x2 = r2 * cos(theta);
		y2 = r2 * sin(theta);

		this.crdnts1.push(createVector(x1, y1));
		this.crdnts2.push(createVector(x2, y2));
	}
}
polarSpectrum.prototype.display = function (xpos, ypos) {
	var hue, x1, y1, x2, y2, type;
	push();
	translate(xpos, ypos)
	colorMode(HSB, 1);
	strokeWeight(this.thickness);
	switch (this.style) {
		case 'points':
			beginShape(POINTS);
			break;
		case 'bars':
		case 'mixed':
			beginShape(LINES);
			break;
		case 'curve':
		case 'line':
		default:
			beginShape();
			break;
	}
	for (var i = 0; i <= this.crdnts1.length - 1; i++) {

		x1 = this.crdnts1[i].x;
		y1 = this.crdnts1[i].y;
		x2 = this.crdnts2[i].x;
		y2 = this.crdnts2[i].y;

		if (this.color[0] == "rainbow") {
			hue = map(i, 0, this.crdnts1.length, 0, 0.5);
		} else {
			hue = this.color[0];
		}
		stroke(hue, this.color[1], this.color[2]);
		fill(hue, this.color[1], this.color[2]);

		switch (this.style) {
			case 'bars':
				vertex(x1, y1);
				vertex(x2, y2);
				break;
			case 'curve':
				curveVertex(x2, y2);
				break;
			case 'points':
			case 'line':
			case 'mixed':
			default:
				vertex(x2, y2);
				break;
		}

	}
	if (this.mirror) {
		for (var i = this.crdnts1.length - 1; i >= 0; i--) {
			x1 = this.crdnts1[i].x;
			y1 = this.crdnts1[i].y;
			x2 = this.crdnts2[i].x;
			y2 = this.crdnts2[i].y;
			if (this.color[0] == "rainbow") {
				hue = map(i, 0, this.crdnts1.length, 1, 0.5);
			} else {
				hue = this.color[0];
			}
			stroke(hue, this.color[1], this.color[2]);
			switch (this.style) {
				case 'bars':
					vertex(-x1, y1);
					vertex(-x2, y2);
					break;
				case 'curve':
					curveVertex(-x2, y2);
					break;
				case 'points':
				case 'line':
				case 'mixed':
				default:
					vertex(-x2, y2);
					break;
			}

		}

	}
	if (this.style == 'line' || 'curve') {
		endShape(CLOSE);
	} else {
		endShape();
	};
	pop();
}
polarSpectrum.prototype.draw = function (xpos, ypos) {
	this.getPoints(xpos, ypos);
	this.display(xpos, ypos);
}

var ParticleSystem = function (position) {
	this.origin = position.copy();
	this.particles = [];
	this.addParticle = function () {
		for (var i = 0; i <= 1 + amplitude.getLevel() * 2; i++) {
			this.particles.push(new Particle(this.origin));
		}
	};
	this.run = function () {
		for (var i = this.particles.length - 1; i >= 0; i--) {
			this.particles[i].run();
			if (this.particles[i].isDead()) {
				this.particles.splice(i, 1);
			}
		}
	};

};

var Particle = function (position) {
	var randx = random(-3, 0);
	var randy = random(-3, 3);
	this.velocity = createVector(randx, randy);
	this.position = position.copy();
	this.lifespan = 200 + 250 * amplitude.getLevel();
	this.run = function () {
		this.update();
		this.display();
	};
	this.update = function () {
		var volx = fft.getEnergy('bass') * 0.1 * random(0, this.velocity.x * 4);
		var voly = fft.getEnergy('bass') * 0.1 * random(0, this.velocity.y * 4);
		var volVec = createVector(volx, voly);
		this.position.add(this.velocity);
		this.position.add(volVec);
		this.lifespan -= 4;
	};
	this.display = function () {
		noStroke;
		strokeWeight(0);
		fill(255, (this.lifespan) / 1.5);
		var size = map(this.lifespan, 80, 0, 0, 5);


		ellipse(this.position.x, this.position.y, 5 + size, 5 + size);

		ellipse(width - this.position.x, this.position.y, 5 + size, 5 + size)

	};
	this.isDead = function () {
		if (this.lifespan < 0) {
			return true;
		} else {
			return false;
		}
	};
};
