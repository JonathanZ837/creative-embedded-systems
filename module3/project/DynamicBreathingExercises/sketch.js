let colorPalette = [[249, 65, 68, 120], [243, 114, 44, 120], [248, 150, 30, 120], [249, 199, 79, 120], [144, 190, 109, 120], [67, 170, 139, 120], [87, 117, 144, 120]]; // warm to cold
let dots = [];

let breathPeriod = 0;
let breathStart = 0;
let numCycles = 6;

let state = "IDLE" // one of IDLE, BREATHING, SUCCESS
let successDuration = 5000;

class Dot {
	constructor(x1, y1, x2, y2, inSize, outSize, colorIdx) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.colorIdx = colorIdx;
		this.inSize = inSize;
		this.outSize = outSize;
	}

	draw(t) {
		let x = lerp(this.x1, this.x2, t);
		let y = lerp(this.y1, this.y2, t);
		let size = lerp(this.outSize, this.inSize, t);
		
		fill(colorPalette[this.colorIdx]);
		circle(x, y, size);
		
	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	noCursor();
	socket = new WebSocket("ws://localhost:8765");

	socket.onmessage = (event) => {
		const msg = JSON.parse(event.data);
		speed = msg.speed;
		footsteps = msg.footsteps;
		backtracks = msg.backtracks;
		restartDots(speed, footsteps, backtracks);
	};

	restartDots(3, 5, 2);
}

function finishBreathing() {
	dots = [];
	state = "SUCCESS";
	successStart = millis();
}

function restartDots(speed, footsteps, backtracks) {
	dots = [];
	
	breathPeriod = Math.sqrt(speed) * 3000
	breathStart = millis();
	let inRadius = 0
	let outRadius = 30 * footsteps
	let inSize = 10 * footsteps
	let outSize = 30 * footsteps
	numCycles = max(1, 2 * floor(speed))
	let numDots = floor((speed + footsteps + backtracks)/3 + 3)
	for (let i = 0; i < numDots; i++) {
		let deg = (TWO_PI/numDots) * i
		let newDot = new Dot(Math.cos(deg) * inRadius, Math.sin(deg) * inRadius, Math.cos(deg) * outRadius, Math.sin(deg) * outRadius, inSize, outSize, floor(backtracks) % 5);
		dots.push(newDot)
	}

	let newDot = new Dot(0,0,0,0, 0, outSize, (floor(backtracks) - 2) % 5);
	dots.push(newDot);

	state = "BREATHING";
}

function draw() {
	background(240,232,220);
	translate(windowWidth/2, windowHeight/2)
	noStroke();
	if (state == "BREATHING") {
		let elapsed = millis() - breathStart;
		let t = (1 - cos(TWO_PI * elapsed / breathPeriod)) / 2;
		
		let cycle = floor(elapsed / breathPeriod);   // completed breaths so far

		if (cycle >= numCycles) {
			finishBreathing();
			return;
		}
		for (let i = 0; i < dots.length; i++) {
			dots[i].draw(t);
		}
	} else if (state == "IDLE") {
		text("Waiting for readings", 0, 0);
	} else if (state == "SUCCESS") {
		text("Good job. Go about your day a little more relaxed! :)", 0, 0);
		if (millis() - successStart > successDuration) {
			state = "IDLE";
		}
	}
}
