//define variables
var mic, fft, omega, alpha, q = 0, supremeSet = [];

//setup stuff
setup = function () {
	//create 3D cnavas
	createCanvas(windowWidth, windowHeight, WEBGL);
	frameRate(10);
	// create the Input device
	mic = new p5.AudioIn();
	//create a filter to remove noise
	filter = new p5.Filter();
	//frameRate(20);
	//initiate the mic and add the filter
	// disconnect unfiltered noise,
	mic.disconnect();
	// and connect to filter
	mic.connect();
	mic.start();
	// Create the fft variable and set the input
	fft = new p5.FFT(0.1, 8192);
	fft.setInput();
	
	supremeSet[0] = new omegaSet(box);
	supremeSet[1] = new omegaSet(box);
	
}
draw = function () {
	//Set the filter to bandpass to remove 
	filter.setType('bandpass');
	//filter.freq(40);
	filter.res(20);
	fft.analyze();
	
	q += 0.1;
	
	background(100);
	push();
	//rotateY(map(mouseX,0,width,-TWO_PI,TWO_PI));
	//rotateX(map(mouseY,0,height,-TWO_PI,TWO_PI));
	
	
	rotateY(PI/4);
	//rotateX(-PI/8);
	translate(-250,0,100);
	
	
	//rotateX(PI/6);
	
	colorMode(HSB,255);
	
	//define lighting
	directionalLight(255, 0, 255, 1, 0, -0.5);
	directionalLight(0, 0, 255, 0, -0.2, 1);
	directionalLight(0, 0, 255, -1, -0.2, 1);
	//draw box in the center to show origin
	specularMaterial((q*2)%255,180,100);
	
	translate(0,0,-windowHeight);
	plane(windowHeight * 3,windowHeight);
	translate(0,0,windowHeight );
	
	specularMaterial((q*2)%255,180,100);
	
	translate(0, windowHeight, 0);
	rotateX(0.5*PI);
	plane(windowHeight*3,windowHeight);
	rotateX(-0.5*PI);
	translate(0, -windowHeight, 0);	
	
	specularMaterial(65,50,130);
	
	translate(windowHeight, 0, 400);
	rotateY(0.5*PI);
	plane(windowHeight,windowHeight);
	rotateY(-0.5*PI);
	translate(-windowHeight, 0, -400);
	
	translate(0, 0, -windowHeight );
	scale(-1,1,1);
	supremeSet[0].draw();
	scale(-1,1,1);
	translate(0, 0, windowHeight);
	
	translate(1000, 0, -windowHeight );
	supremeSet[1].draw();
	translate(-1000, 0,windowHeight);

	
}
var Spectrum = function (x, y, z, min = 0, max = 135, inc = 5) {
	this.min = min;
	this.max = max;
	this.increment = inc;
	this.width = windowHeight;
	this.centerPos = createVector(x,y,z);
	this.shape = sphere;
	this.color = 'rainbow';
	this.style = 'spiral' ;
	this.spiralAngle = 0;
	this.addShape = function () {};
	this.objectArray = [];
	//this.partSys = new ParticleSystem(createVector(0,0,0));
	var dArray = [0,0,0,0,0,0,0];
	var D = 0;

	this.draw = function () {
		//loop through frequencies and draw spectrumObjects
		colorMode(HSB,255);
		for(var i = min; i <= max; i += inc){
			var pos = createVector(map(i, min, max, -this.width/2, this.width/2),this.centerPos.y,this.centerPos.z);
			if (this.color = 'rainbow'){
				var hue = map(i,min,max,0,255);
			} else {
				var hue = this.color[0];
			}
			
			this.objectArray[i] = new SpectrumObject(this.shape, this.centerPos, this.min, this.max, i, hue);
			
			translate(pos.x + this.centerPos.x, this.centerPos.y, this.centerPos.z);
			
			if (this.style == 'spiral'){
				var gamma = map(i, min, max, 0, TWO_PI*0.5) + this.spiralAngle;
				var d = map(fft.getEnergy(i),0,255,50,125);
				dArray[6] = dArray[5];
				dArray[5] = dArray[4];
				dArray[4] = dArray[3];
				dArray[3] = dArray[2];
				dArray[2] = dArray[1];
				dArray[1] = dArray[0];
				dArray[0] = d;
				D = (dArray[2]+dArray[1]+dArray[0])/3;
				translate(0, D * sin(gamma), D * cos(gamma));
			}

			this.objectArray[i].draw();
			if (i == inc * floor((max-min)/inc) + min){
				//this.partSys.run();
			}
			
			if (this.style == 'spiral'){ 
				translate(0, -D * sin(gamma), -D * cos(gamma)); 
			}
			
			translate(-pos.x - this.centerPos.x, -this.centerPos.y, -this.centerPos.z);
		}
	};
}

var SpectrumObject = function (shape, origin,min,max, freq, hue) {
	//get the cordinates relative to Spectrum center
	
	//calculate angle of velocity
	//var angle = map(fft.getEnergy(i),0,255,0,TWO_PI);
	var scale = 0.2;
	this.freq = freq;
	this.shape = shape;
	this.angle = PI/2;
	
	this.velocity = createVector(-fft.getEnergy(freq) * this.angle/255,  0, 0);
	
	
	this.size = map(fft.getEnergy(freq), 0,200, 1, 30);
	
	this.hue = hue;
	this.saturation = map(fft.getEnergy(freq),100,150,200,220);
	this.brightness = map(fft.getEnergy(freq),0,60,220,240);
	this.color = specularMaterial(this.hue,this.saturation,this.brightness);
	
	this.draw = function () {
		colorMode(HSB,255);
		this.color;	
		rotateX(this.velocity.x);
		if(this.shape == cylinder){rotateZ(PI/2);}
		this.shape(this.size);
		if(this.shape == cylinder){rotateZ(-PI/2);}
		rotateX(-this.velocity.x);
	}
	
}

var omegaSet = function (shape){
	this.mode = 'star';
	this.omegaArray = [];
	var spectrumNo = 24;
	for(var i = 1; i <= spectrumNo; i ++ ){
		var theta = i * TWO_PI/spectrumNo; 
		this.omegaArray[i] = new Spectrum(0, 0, 0, 20, 135 , 6);
		this.omegaArray[i].shape = shape;
		this.omegaArray[i].style = 'linear';
		this.omegaArray[i].width = windowHeight;
		this.omegaArray[i].spiralAngle = theta;
	}		
	this.draw = function () {
		for(var i = 1; i <= spectrumNo; i ++ ){
			rotateZ(q/4);
			if(this.mode = "star"){
				rotateZ(i*TWO_PI/spectrumNo + PI/2);
				translate(-this.omegaArray[i].width/2,0,0);
			}
			this.omegaArray[i].draw();
			if(this.mode = "star"){
				translate(this.omegaArray[i].width/2,0,0);
				rotateZ(-(i*TWO_PI/spectrumNo + PI/2));
			}
			rotateZ(-q/4);
		}
	}		
}
var Particle = function (origin) {
	this.shape = sphere;
	this.size = 2;
	this.color = [255,0,255,this.lifespan];
	this.lifespan = 200;
	this.position = origin.copy();
	this.accelaration = createVector(0.5,random(0,0),random(0,0));
	this.velocity= createVector(10,0);
	this.update = function () {
		this.lifespan -= 5;
		this.velocity.add(this.accelaration);
		this.position.add(this.velocity);
	}
	this.draw = function () {
		basicMaterial(this.color[0],this.color[1],this.color[2],255);
		translate(this.position.x,this.position.y,this.position.z);
		this.shape(this.size);
		translate(-this.position.x,-this.position.y,-this.position.z);
	}
	this.isDead = function () {
		if (this.lifespan <= 0) {
			return true;
			console.log(true);
		} else {
			return false;
		}
	}
	this.run = function () {
		this.update();
		this.draw();
	} 
}
var ParticleSystem = function (origin) {
	this.origin = origin.copy();
	this.particles = [];
	this.addParticle = function(){
		for (var i = 1; i <= fft.getEnergy("bass") * 5/255; i++) {
			this.particles.push(new Particle(this.origin));
		}
	}
	this.run = function(){
		this.addParticle();
		for (i = 0; i < this.particles.length; i++){
			if(this.particles[i].isDead()){
				this.particles.slice(i,1);
			} else {
				this.particles[i].run();
			}
		}
	}
}
