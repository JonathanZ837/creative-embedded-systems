
let spaceBetweenDots = 50
let dotDiameter = 10
let dots = [];
let width = 0; // in dots
let length = 0;
let numPainters = 4;
let colorPalette = [[1, 41, 95], [132, 147, 36], [255, 179, 15], [253, 21, 27]];
let painters = [];

class Dot {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}

	display() {
		circle(this.x, this.y, dotDiameter);
	}
}

class Painter {
	constructor(r, g, b, startingDot) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.pDots = [startingDot];
		this.state = 'IDLE'
	}

	move() {

	}

	display() {

	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	noStroke();
	background(237,232,208);
	fill(201, 197, 177);
	width = Math.floor(windowWidth / spaceBetweenDots);
	height = Math.floor(windowHeight/spaceBetweenDots);
	for (let i = 0; i < height; i++) {
		let row = [];
		for (let j = 0; j < width; j++) {
			row.push(new Dot(j * spaceBetweenDots, i * spaceBetweenDots));
		}
		dots.push(row);
	}

	let startingDots = [dots[1][1], dots[height - 2][1], dots[height-2][width-2], dots[1][width-2]]

	for (let i = 0; i < numPainters; i++) {
		painters.push(new Painter(colorPalette[i][0], colorPalette[i][1], colorPalette[i][2],startingDots[i]))
	}

}

function draw() {
	translate(spaceBetweenDots, spaceBetweenDots)
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			dots[i][j].display();
		}
	}

	for (let i = 0; i < numPainters; i++) {
		painters[i].move();
		painters[i].display();
	}
}
