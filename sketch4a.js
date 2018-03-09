
/////////CODED BY AZEEZ ABASS
//////// ALIAS: DUCKLIN5
//////// PLEASE DO NOT MODIFY WITHOUT THE CONCENT OF OWNER
////////http://github.com/ducklin5
//define variables


var mic, fft, omega, alpha, q = 0, supremeSet, bg, starfield, frame = 0, rX = 0.1, rY = 0.1, rZ = 0.1;
//setup stuff
setup = function () {
	//create 3D cnavas
	createCanvas(1200, 600, WEBGL);
	//frameRate(10);
	// create the Input device
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

	supremeSet = new omegaSet(box);
	starfield = new ParticleSystem(createVector(0,0,0));

};
mouseDragged = function () {
	rotateY(map(mouseX,0,width,-TWO_PI,TWO_PI));
	rotateX(map(mouseY,0,height,-TWO_PI,TWO_PI));
};
draw = function () {
	scale(0.9)
	//camera(0,0,0);
	//Set the filter to bandpass to remove 
	filter.setType('bandpass');
	//filter.freq(40);
	filter.res(20);
	fft.analyze();
	colorMode(HSB,255);


	q += 0.25;	
	//for(var i = 500; i <= 1000; i+= 15){
	//	q += map(fft.getEnergy(i,i + 15),0,map(i,500,1000,50,20),0,map(i,500,1000,0,0.1));
	//}

	background(255);
	push();

	//rX += 0.005;
	//rY += 0.005;
	//rZ += 0.005;

	//rotateX(cos(rX));
	//rotateY(sin(rY));
	//rotateZ(cos(rZ));
	//rotateZ(rZ);
	//rotateY(rY);

	//rotateY(PI/4);

	starfield.origin = createVector(600,random(-height,height),random(-height/1.5,1000));
	starfield.shape = cylinder;
	starfield.color = [random(0,255),115,180];
	starfield.size = 2;
	starfield.lifespan = 300;
	starfield.accelaration = createVector(0,0,0);
	starfield.velocity= createVector(-20,0,0);
	starfield.genSpeed = 1;
	frame ++;

	if (frame % 2 == 0){
		starfield.run();
	} else {
		starfield.draw();
	}

	translate(-windowHeight/20,0,random(-0.5,0.5)* width * fft.getEnergy('bass') / 1000 + windowHeight/12);




	//define lighting
	directionalLight(0, 0, 200, -1, 0.4, 1);
	directionalLight(0, 0, 200, 1, 0.4, 1);
	//directionalLight(0, 0, 255, -1, -0.2, 1);
	//draw box in the center to show origin
	fill((q)%255,80,25);

	box(1000);

	translate(-windowHeight/4.5, 0, 0);
	supremeSet.draw();
	translate(windowHeight/4.5, 0, 0);

	translate(windowHeight/4.5, 0, 0);
	scale(-1,1,1);
	supremeSet.draw();
	scale(-1,1,1);
	translate(-windowHeight/4.5, 0, 0);


};
var Spectrum = function (x, y, z, min = 0, max = 135, inc = 10) {
	this.min = min;
	this.max = max;
	this.increment = inc;
	this.width = windowWidth/2;
	this.centerPos = createVector(x,y,z);
	this.shape = sphere;
	this.color = 'rainbow';
	this.style = 'spiral' ;
	this.spiralAngle = 0;
	this.addShape = function () {};
	this.objectArray = [];
	this.partSys = new ParticleSystem(createVector(0,0,0));
	this.partSys.genSpeed = 'music';
	var dArray = [0,0,0,0,0,0,0];
	var D = 0;

	this.draw = function () {
		//loop through frequencies and draw spectrumObjects
		colorMode(HSB,255);
		for(var i = min; i <= max; i += inc){
			var pos = createVector(map(i, min, max, -this.width/2, this.width/2),this.centerPos.y,this.centerPos.z);
			var hue;
			if (this.color == 'rainbow'){
				hue = map(i,min,max,0,255);
			} else {
				hue = this.color[0];
			}

			this.objectArray[i] = new SpectrumObject(this.shape, this.centerPos, this.min, this.max, i, hue);

			translate(pos.x + this.centerPos.x, this.centerPos.y, this.centerPos.z);

			var gamma;
			if (this.style == 'spiral'){
				gamma = map(i, min, max, 0, 1.5*PI) + this.spiralAngle;
				var d = map(fft.getEnergy(i),0,255,40,120);
				dArray[6] = dArray[5];
				dArray[5] = dArray[4];
				dArray[4] = dArray[3];
				dArray[3] = dArray[2];
				dArray[2] = dArray[1];
				dArray[1] = dArray[0];
				dArray[0] = d;
				D = (dArray[2]+dArray[1]+dArray[0])/2;
				translate(0, D * sin(gamma), D * cos(gamma));
			}

			this.objectArray[i].draw();
			//if (i == inc * floor((max-min)/inc) + min){
			if (i == min){
				this.partSys.run();
			}

			if (this.style == 'spiral'){ 
				translate(0, -D * sin(gamma), -D * cos(gamma)); 
			}

			translate(-pos.x - this.centerPos.x, -this.centerPos.y, -this.centerPos.z);
		}
	};
};

var SpectrumObject = function (shape, origin,min,max, freq, hue) {
	//get the cordinates relative to Spectrum center

	//calculate angle of velocity
	//var angle = map(fft.getEnergy(i),0,255,0,TWO_PI);
	var scale = 0.2;
	this.freq = freq;
	this.shape = shape;
	this.angle = PI/2;

	this.velocity = createVector(-fft.getEnergy(freq) * this.angle/255,  0, 0);


	this.size = map(fft.getEnergy(freq), 0,200, 1, 40);

	this.hue = hue;
	this.saturation = map(fft.getEnergy(freq),50,75,150,220);
	this.brightness = 100 + map(fft.getEnergy(freq),0,60,220,240);
	this.color = specularMaterial(this.hue,this.saturation,this.brightness);

	this.draw = function () {
		colorMode(HSB,255);
		//this.color;	
		rotateX(this.velocity.x);
		if(this.shape == cylinder){rotateZ(PI/2);}
		this.shape(this.size);
		if(this.shape == cylinder){rotateZ(-PI/2);}
		rotateX(-this.velocity.x);
	};

};

var omegaSet = function (shape){
	this.mode = 'spiral';
	this.omegaArray = [];
	var spectrumNo = 3;
	for(var i = 1; i <= spectrumNo; i ++ ){
		var theta = i * TWO_PI/spectrumNo; 
		this.omegaArray[i] = new Spectrum(0, 0, 0, 20, 135 , 12);
		this.omegaArray[i].shape = shape;
		this.omegaArray[i].style = 'spiral';
		this.omegaArray[i].width = windowWidth/4;
		this.omegaArray[i].spiralAngle = theta;
	}		
	this.draw = function () {
		for(var i = 1; i <= spectrumNo; i ++ ){
			rotateX(q/4);
			if(this.mode == "star"){
				rotateZ(i*TWO_PI/spectrumNo + PI/2);
				translate(-this.omegaArray[i].width/2,0,0);
			}
			this.omegaArray[i].draw();
			if(this.mode == "star"){
				translate(this.omegaArray[i].width/2,0,0);
				rotateZ(-(i*TWO_PI/spectrumNo + PI/2));
			}
			rotateX(-q/4);
		}
	};		
};
var Particle = function (origin,shape,size,color,lifespan,accelaration,velocity) {
	this.shape = shape;
	this.size = size;
	this.color = color;
	this.lifespan = lifespan;
	this.position = origin.copy();
	this.accelaration = accelaration.copy();
	this.velocity= velocity.copy();
	this.update = function () {
		this.lifespan -= 5;
		this.velocity.add(this.accelaration);
		this.position.add(this.velocity);
	};
	this.draw = function () {
		fill(this.color[0],this.color[1],this.color[2]);
		translate(this.position.x,this.position.y,this.position.z);
		rotateZ(PI/2);
		this.shape(this.size, this.size * 30);
		rotateZ(-PI/2);
		translate(-this.position.x,-this.position.y,-this.position.z);
	};
	this.isDead = function () {
		if (this.lifespan <= 0) {
			return true;
		} else {
			return false;
		}
	};
	this.run = function () {
		this.update();
		this.draw();
	}; 
};
var ParticleSystem = function (origin) {
	this.shape = sphere;
	this.size = 2;
	this.color = [255,0,255];
	this.lifespan = 500;
	this.accelaration = createVector(-1,0,0);
	this.velocity= createVector(-2,0,0);
	this.origin = origin.copy();
	this.particles = [];
	this.genSpeed = 'music';
	this.addParticle = function(){
		var limit;
		if(this.genSpeed == 'music'){
			limit = fft.getEnergy(80,135) * 5/255;
		} else {
			limit = this.genSpeed;
		}
		for (var i = 1; i <= limit; i++) {
			this.particles.push(new Particle(this.origin, this.shape,this.size,this.color,this.lifespan,this.accelaration,this.velocity));
		}
	};
	this.draw = function () {
		for (i = 0; i < this.particles.length; i++){
			if(this.particles[i].isDead()){
				this.particles.slice(i,1);
			} else {
				this.particles[i].run();
			}
		}
	};
	this.run = function(){
		this.addParticle();
		this.draw();
	};
};
