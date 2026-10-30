let colorPalette = [[249, 65, 68, 120], [243, 114, 44, 120], [248, 150, 30, 120], [249, 199, 79, 120], [144, 190, 109, 120], [67, 170, 139, 120], [87, 117, 144, 120]]; // warm to cold
let dots = [];

let breathPeriod = 0;
let breathStart = 0;
let numCycles = 6;

let state = "IDLE" // one of IDLE, BREATHING, SUCCESS
let successDuration = 10000;

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

function connect() {
	socket = new WebSocket("ws://localhost:8765");
	socket.onopen = () => console.log("Connected to Pi");
	socket.onmessage = (event) => {
		const msg = JSON.parse(event.data);
		console.log("Received", msg);
		restartDots(msg.speed, msg.footsteps, msg.backtracks);
	};
	socket.onclose = () => {
		console.log("Disconnected, retrying in 2 s...");
		setTimeout(connect, 2000);
	};
}


function setup() {
	createCanvas(windowWidth, windowHeight);
	noCursor();
	connect();

	textSize(48); 
	textFont('Georgia');
	textAlign(CENTER, CENTER);

}

function finishBreathing() {
	dots = [];
	state = "SUCCESS";
	successStart = millis();
}

function restartDots(speed, footsteps, backtracks) {
	dots = [];

	speed *= 5
	
	breathPeriod = Math.sqrt(speed) * 4000
	breathStart = millis();
	let inRadius = 0
	let outRadius = 30 * constrain(footsteps, 1, 10)
	let inSize = 30 * constrain(footsteps, 1, 10)
	let outSize = 60 * constrain(footsteps, 1, 10)
	numCycles = max(1, 2 * floor(speed))
	let numDots = floor((speed + footsteps + backtracks)/3)

	for (let i = 0; i < numDots; i++) {
		let deg = (TWO_PI/numDots) * i
		let newDot = new Dot(Math.cos(deg) * inRadius, Math.sin(deg) * inRadius, Math.cos(deg) * outRadius, Math.sin(deg) * outRadius, inSize, outSize, backtracks % 5);
		dots.push(newDot)
	}

	let newDot = new Dot(0,0,0,0, 0, outSize, (backtracks + 2) % 5);
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
		fill(0, 0, 0);
		text("Waiting for readings", 0, 0);
	} else if (state == "SUCCESS") {
		fill(0, 0, 0);
		text("You're done. Go about your day a little more relaxed! :)", 0, 0);
		if (millis() - successStart > successDuration) {
			state = "IDLE";
		}
	}
}
