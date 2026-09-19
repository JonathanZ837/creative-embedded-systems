
let dots = [];
let spaceBetweenDots = 50;
let dotDiameter = 10;

let width = 0; // in dots
let height = 0; // in dots

let numPainters = 4;
let painters = [];
let painterDotDiameter = 20;
let painterIdleTime = 30;
let lerpSpeed = 0.05;
let painterStrokeWeight = 8;
let painterDotOpacity = 170;
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
		this.targetDot = startingDot;
		this.phantomDotX = startingDot.x;
		this.phantomDotY = startingDot.y;
		this.state = 'IDLE'
		this.idleTime = painterIdleTime;
		this.movingLerp = 0;
		this.lastDirectionInverse = [0,0];
	}

	move() {
		if (this.state == 'IDLE') {
			if (this.idleTime == 0) {
				this.idleTime = painterIdleTime;

				let directionType = -1;
				// determine direction based on boundary conditions :o				
				if (this.currDot.i == 0) { // upper
					if (this.currDot.j == 0) {
						directionType = 6;
					} else if (this.currDot.j == width - 1) {
						directionType = 8;
					} else {
						directionType = 7;
					}
				} else if (this.currDot.i == height - 1) { // lower
					if (this.currDot.j == 0) {
						directionType = 0;
					} else if (this.currDot.j == width - 1) {
						directionType = 2;
					} else {
						directionType = 1;
					}
				} else {
					if (this.currDot.j == 0) { // middle
						directionType = 3;
					} else if (this.currDot.j == width - 1) {
						directionType = 5;
					} else {
						directionType = 4;
					}
				}

				let idx = floor(random(1, painterDirections[directionType].length));
				let direction = painterDirections[directionType][idx];
				if (direction[0] == this.lastDirectionInverse[0] && direction[1] == this.lastDirectionInverse[1]) {
					console.log("inverse spotted")
					direction = painterDirections[directionType][(idx + 1) % painterDirections[directionType].length];
				}
				
				this.lastDirectionInverse = [-direction[0], -direction[1]]
				let newDot = dots[this.currDot.i + direction[0]][this.currDot.j + direction[1]]
				this.targetDot = newDot

				this.state = 'MOVING'
			} else {
				this.idleTime -= 1;
			}
		} else if (this.state == 'MOVING') {
			if (this.movingLerp >= 1) {
				this.movingLerp = 0;
				this.pDots.push(this.targetDot);
				this.currDot = this.targetDot;
				this.state = 'IDLE'
			} else {
				this.phantomDotX = lerp(this.phantomDotX, this.targetDot.x, this.movingLerp)
				this.phantomDotY = lerp(this.phantomDotY, this.targetDot.y, this.movingLerp)
				this.movingLerp += lerpSpeed;
			}
		}
	}

	display() {

		fill(this.r, this.g, this.b, painterDotOpacity)
		for (let i = 0; i < this.pDots.length - 1; i++) {
			noStroke();
			circle(this.pDots[i].x, this.pDots[i].y, painterDotDiameter)
			strokeWeight(painterStrokeWeight)
			stroke(this.r, this.g, this.b, painterDotOpacity)
			line(this.pDots[i].x, this.pDots[i].y, this.pDots[i+1].x, this.pDots[i+1].y)
		}
		noStroke()
		circle(this.pDots[this.pDots.length-1].x, this.pDots[this.pDots.length-1].y, painterDotDiameter)

		if (this.state == 'MOVING') {
			strokeWeight(painterStrokeWeight)
			stroke(this.r, this.g, this.b, painterDotOpacity)
			line(this.pDots[this.pDots.length-1].x, this.pDots[this.pDots.length-1].y, this.phantomDotX, this.phantomDotY)
			noStroke()
			circle(this.phantomDotX, this.phantomDotY, painterDotDiameter)
		}
		
	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	
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
	background(237,232,208);
	translate(spaceBetweenDots, spaceBetweenDots)
	noStroke();
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			dots[i][j].display();
		}
	}

	for (let i = 0; i < numPainters; i++) {
		
		painters[i].display();
		painters[i].move();
	}
}
