let colorPalette = [[1, 41, 95, 120]];
let dots = [];
let speed = 5;

let numDots = 6;

let inRadius = 10;
let outRadius = 200;

let breathPeriod = 8000;
let breathStart = 0;

class Dot {
	constructor(x1, y1, x2, y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}

	draw(t) {
		let x = lerp(this.x1, this.x2, t);
		let y = lerp(this.y1, this.y2, t);
		
		fill(colorPalette[0]);
		circle(x, y, 50/t);
		
	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	noCursor();
	socket = new WebSocket("ws://localhost:8765");

	for (let i = 0; i < numDots; i++) {
		let deg = (TWO_PI/numDots) * i
		let newDot = new Dot(Math.cos(deg) * inRadius, Math.sin(deg) * inRadius, Math.cos(deg) * outRadius, Math.sin(deg) * outRadius);
		dots.push(newDot)
	}

	socket.onmessage = (event) => {
		const msg = JSON.parse(event.data);
		speed = msg.speed;
		dots = [];
		for (let i = 0; i < numDots; i++) {
			let deg = (TWO_PI/numDots) * i
			let newDot = new Dot(Math.cos(deg) * inRadius, Math.sin(deg) * inRadius, Math.cos(deg) * outRadius, Math.sin(deg) * outRadius);
			dots.push(newDot)
		}
	};

	
}

function draw() {
	background(240,232,220);
	translate(windowWidth/2, windowHeight/2)
	noStroke();
	if (speed !== null) {
		text(`Speed: ${speed.toFixed(2)} m/s`, 20, 30);
		let elapsed = millis() - breathStart;
		let t = (1 - cos(TWO_PI * elapsed / breathPeriod)) / 2;

		for (let i = 0; i < numDots; i++) {
			dots[i].draw(t);
		}
	} else {
		text("no speed detected");
	}
}
