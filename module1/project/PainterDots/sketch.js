
let dots = [];
let spaceBetweenDots = 50;
let dotDiameter = 10;

let width = 0; // in dots
let height = 0; // in dots

let numPainters = 4;
let painters = [];
let painterDotDiameter = 20;
let painterIdleTime = 60;
//let painterDirections = [[1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]
let painterDirections = [[[-1, 0], [-1, 1], [0, 1]], [[-1, 0], [-1, 1], [0, 1], [-1, -1], [0, -1]], [[-1, 0], [-1, -1], [0, -1]], [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]],[[-1, 0], [-1, 1], [-1, -1], [0, -1], [0,1], [1, 0], [1, -1], [1,1]], [[-1, 0], [-1, -1], [0, -1], [1, 0], [1, -1]],[[1, 0], [0, 1], [1, 1]],[[1, 0], [0, 1], [1, 1], [0, -1], [1, -1]], [[1, 0], [0, -1], [1, -1]]] // bottom left, bottom center, bottom right, middle left, middle center, middle right, upper left, upper center, upper right
let colorPalette = [[1, 41, 95], [132, 147, 36], [255, 179, 15], [253, 21, 27]];

class Dot {
	constructor(x,y, i, j) {
		this.x = x;
		this.y = y;
		this.i = i; // the row that this dot belongs to in dots[]
		this.j = j; // the col that this dot belongs to in dots[]
	}

	display() {
		fill(201, 197, 177);
		circle(this.x, this.y, dotDiameter);
	}
}

class Painter {
	constructor(r, g, b, startingDot) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.pDots = [startingDot];
		this.currDot = startingDot;
		this.state = 'IDLE'
		this.idleTime = painterIdleTime;
		this.movingTime = 60;
	}

	move() {
		if (this.state == 'IDLE') {
			if (this.idleTime == 0) {
				this.idleTime = painterIdleTime;

				let direction = [0, 0];

				// determine direction based on boundary conditions :o				
				if (this.currDot.i == 0) { // upper
					if (this.currDot.j == 0) {
						direction = random(painterDirections[6]);

					} else if (this.currDot.j == width - 1) {
						direction = random(painterDirections[8]);
					} else {
						direction = random(painterDirections[7]);
					}
				} else if (this.currDot.i == height - 1) { // lower
					if (this.currDot.j == 0) {
						direction = random(painterDirections[0]);

					} else if (this.currDot.j == width - 1) {
						direction = random(painterDirections[2]);
					} else {
						direction = random(painterDirections[1]);
					}
				} else {
					if (this.currDot.j == 0) { // middle
						direction = random(painterDirections[3]);
					} else if (this.currDot.j == width - 1) {
						direction = random(painterDirections[5]);
					} else {
						direction = random(painterDirections[4]);
					}
				}
				let newDot = dots[this.currDot.i + direction[0]][this.currDot.j + direction[1]]
				this.pDots.push(newDot)
				this.currDot = newDot
				this.state == 'MOVING'
			} else {
				this.idleTime -= 1;
			}
		} else if (this.state == 'MOVING') {
			if (this.movingTime == 0) {
				this.movingTime = 60;
				this.state = 'IDLE'
			} else {
				this.movingTime -= 1;
			}
		}
	}

	display() {
		for (let i = 0; i < this.pDots.length; i++) {
			fill(this.r, this.g, this.b, 125)
			circle(this.pDots[i].x, this.pDots[i].y, painterDotDiameter)
			console.log(this.pDots[i].x)
			console.log(this.pDots[i].y)
		}
	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	noStroke();
	background(237,232,208);
	width = Math.floor(windowWidth / spaceBetweenDots);
	height = Math.floor(windowHeight / spaceBetweenDots);
	for (let i = 0; i < height; i++) {
		let row = [];
		for (let j = 0; j < width; j++) {
			row.push(new Dot(j * spaceBetweenDots, i * spaceBetweenDots, i, j));
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
