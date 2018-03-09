var mic, fft, audioEl;

var smoothing = 0;
var binCount = 256;

var dots = [];
//dots will be mirrored, so this is infact half of the dotCount
var dotCount = 7;

var currentInput;

var loader = document.querySelector(".loader");
var isSoundPlayed = false;

function setup() {
	//create full width and full height p5 canvas
	var myCanvas = createCanvas(windowWidth, windowHeight);

	colorMode(HSB, 255);

	for (var i = 0; i < dotCount; i++) {
		var newDot = new Dot(i);
		dots.push(newDot);
	}

	for (var i = dotCount - 1; i >= 0; i--) {
		var newDot = new Dot(i, map(i, dotCount, 0, HALF_PI, -HALF_PI + QUARTER_PI / 2));
		dots.push(newDot);
	}
	// setup mic
	mic = new p5.AudioIn();
	mic.start();	

	currentInput = mic;

	// initialize the FFT, plug in our variables for smoothing and binCount
	fft = new p5.FFT(smoothing, binCount);
	fft.setInput(currentInput);
}

function draw() {
	if(typeof audioEl != "undefined" && audioEl.isLoaded() && !audioEl.isPlaying()) { // Do once
		if  (isSoundPlayed == false){
			audioEl.play();
			isSoundPlayed = true;
		}
        loader.classList.remove("loading");
    }
	background(150, 50, 50,200);
	stroke(255);
	// translate all x / y coordinates to the center of the screen
	translate(width / 2, height / 1.75);

	var spectrum = fft.analyze(binCount);


	for (var i = 0; i < dots.length; i++) {
		var fftAmp = fft.getEnergy(dots[i].freq);
		dots[i].seek(fftAmp);
		dots[i].update();
		stroke(255);
		dots[i].display(fftAmp);
	}
	colorMode(HSB,255);
	for (var i = 0; i < dots.length; i++) {
		for (var j = 0; j < dots.length; j++) {
			var initial = color(map(dots[i].index, 0, dotCount, 1, 255), 255, 255);
			var gradient = [initial, initial, color(1,1,1,1), color(1,1,1,1), color(1,1,1,1)];
			if (dots[i].index != dots[j].index && i != j + 1 && i != j - 1) {
				//gradientLine(dots[i].location.x, dots[i].location.y, dots[j].location.x, dots[j].location.y, gradient, 4);
				line(dots[i].location.x, dots[i].location.y, dots[j].location.x, dots[j].location.y);
			}
		}
	}

	labelStuff();
}

function gradientLine(x1, y1, x2, y2, cArray, steps) {
	var lineLength = createVector(x2 - x1, y2 - y1);
	var betweenNodes = p5.Vector.div(lineLength, cArray.length - 1);
	var startNode = createVector(x1, y1);
	for (i = 0; i < cArray.length - 1; i++) {
		if(cArray[i] != cArray[i+1]){
			for (var j = steps; j >= 1; j--) {
				var inter = map(j, 1, steps, 0, 1);
				var c = lerpColor(cArray[i], cArray[i + 1], inter);
				stroke(c);
				line(startNode.x, startNode.y, startNode.x + (betweenNodes.x * j / steps), startNode.y + (betweenNodes.y * j / steps));
			}
		} else {
			stroke(cArray[i]);
			line(startNode.x, startNode.y, startNode.x + betweenNodes.x, startNode.y + betweenNodes.y );
		}
		stroke(0, 0, 255);
		startNode.add(betweenNodes);
	}
}

// ===========
// Dot Class
// ===========

function Dot(index, angleMap = map(index, 0, dotCount, 3 * HALF_PI - QUARTER_PI / 2, HALF_PI)) {
	this.index = index;
	this.freq = map(this.index, 0, dotCount, 10, 10000);

	this.angleMap = angleMap;
	this.angle = p5.Vector.fromAngle(this.angleMap);

	this.location = createVector(0, 0);
	this.velocity = createVector(0, 0);
	this.acceleration = createVector(0, 0);

	this.maxspeed = 1;

	this.r = 10; //radius of the "dot"
	this.seek = function (fftAmp) {
		//reset acceleration to 0 each cycle.
		//this.acceleration.mult(0);
		//this.velocity.mult(1);
		// dot seeks angle by fftAmp
		var base = p5.Vector.mult(this.angle, 100);
		var fftVector = p5.Vector.mult(this.angle, roundx(fftAmp*fftAmp,255));
		fftVector.mult(1/(255));
		var newTarget = p5.Vector.add(base, fftVector);
		this.location = createVector(newTarget.x, newTarget.y) ;
	};
	this.update = function () {
		//update velocity
		//this.velocity.add(this.acceleration);
		//limit speed
		//this.velocity.limit(this.maxspeed);
		//this.location.add(this.velocity);

		this.checkEdges();
	};
	this.display = function (fftAmp) {
		var c = map(this.index, 0, dotCount, 0, 255);
		fill(c, 255, 255);
		ellipse(this.location.x, this.location.y, this.r, this.r);
		//text(fftAmp, this.location.x, this.location.y);
	};
	// prevent dots from flying off screen
	this.checkEdges = function () {
		var x = this.location.x;
		var y = this.location.y;
		if (x > width || x < 0 || y > height || y < 0) {
			x = width / 2;
			y = height / 2;
		}
	};
}

// =======
// Helpers
// =======
function roundx(input,x){
	return Math.round(input/x)*x;
}

function keyPressed() {
	if (key == 'T') {
		toggleInput();
	}
}

function toggleInput() {
	console.log("currentInput: " + currentInput + " " + "typeof audioEl: " + typeof audioEl );
	if( typeof audioEl == "undefined"){
		alert("Please select a file first");
	} else if (currentInput == mic && typeof audioEl != "undefined" ) {
		isSoundPlayed = false;
		currentInput = audioEl;	
		mic.stop();
	} else	{
		audioEl.stop();
		currentInput = mic;
	}
	fft.setInput(currentInput);
}

document.getElementById("audiofile").onchange = function(event) {
    if(event.target.files[0]) {
        if(typeof audioEl != "undefined") { // Catch already playing audioEls
            audioEl.disconnect();
            audioEl.stop();
        }
        // Load our new audioEl
        audioEl = loadSound(URL.createObjectURL(event.target.files[0]));
        loader.classList.add("loading");
		toggleInput();
		isSoundPlayed = false;
    }
}

function labelStuff() {
	var inputName = currentInput === mic ? "mic" : "soundfile";
	text('Press "T" to change input from mouse to mic or vice versa \n Current Input: ' + inputName, -width / 2 + 20, height/2.5 );
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
