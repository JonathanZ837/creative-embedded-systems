let colorPalette = [[1, 41, 95], [132, 147, 36], [255, 179, 15], [253, 21, 27]];

let speed = 0;

class Dot {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}

	display() {
		fill(201, 197, 177);
		circle(this.x, this.y, dotDiameter);
	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	noCursor();
	socket = new WebSocket("ws://localhost:8765");

	socket.onmessage = (event) => {
		const msg = JSON.parse(event.data);
		speed = msg.speed;
		
	};
	

}

function draw() {
	background(237,232,208);
	noStroke();
	if (speed !== null) {
		text(`Speed: ${speed.toFixed(2)} m/s`, 20, 30);
	} else {
		text("no speed detected");
	}
}
