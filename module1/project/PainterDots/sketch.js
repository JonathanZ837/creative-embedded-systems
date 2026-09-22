
let dots = [];
let spaceBetweenDots = 50;
let dotDiameter = 10;

let width = 0; // in dots
let height = 0; // in dots

let numPainters = 4;
let painters = [];
let painterDotDiameter = 20;
let painterIdleTime = 5;
let lerpSpeed = 0.05;
let painterStrokeWeight = 8;
let painterDotOpacity = 170;
let painterDirections = [[1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]
//let painterDirections = [[[-1, 0], [-1, 1], [0, 1]], [[-1, 0], [-1, 1], [0, 1], [-1, -1], [0, -1]], [[-1, 0], [-1, -1], [0, -1]], [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]],[[-1, 0], [-1, 1], [-1, -1], [0, -1], [0,1], [1, 0], [1, -1], [1,1]], [[-1, 0], [-1, -1], [0, -1], [1, 0], [1, -1]],[[1, 0], [0, 1], [1, 1]],[[1, 0], [0, 1], [1, 1], [0, -1], [1, -1]], [[1, 0], [0, -1], [1, -1]]] // bottom left, bottom center, bottom right, middle left, middle center, middle right, upper left, upper center, upper right

let painterStartingPositions = [[]]
let colorPalette = [[1, 41, 95], [132, 147, 36], [255, 179, 15], [253, 21, 27]];

class Dot {
	constructor(x,y, i, j) {
		this.x = x;
		this.y = y;
		this.i = i; // the row that this dot belongs to in dots[]
		this.j = j; // the col that this dot belongs to in dots[]
		this.painter = null;
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
		this.lastDirection = [0,0]

		startingDot.painter = this;
	}

	getDirection() {
		let possibleIndices = []
		for (let i = 0; i < painterDirections.length; i++) {
			let possibleDirection = painterDirections[i]
			if (this.currDot.i + possibleDirection[0] < height && this.currDot.i + possibleDirection[0] >= 0 && this.currDot.j + possibleDirection[1] < width && this.currDot.j + possibleDirection[1] >= 0) {
				console.log(this.currDot.i + possibleDirection[0],this.currDot.j + possibleDirection[1] )
				let nextDot = dots[this.currDot.i + possibleDirection[0]][this.currDot.j + possibleDirection[1]]
				if (nextDot.painter == null) {
					possibleIndices.push(i);
					if (possibleDirection[0] == this.lastDirection[0] && possibleDirection[1] == this.lastDirection[1]) {
						possibleIndices.push(i);
						possibleIndices.push(i);
					}
				}
			}
		}

		if (possibleIndices.length > 0) {
			return random(possibleIndices);
		} else {
			return -1;
		}
	}

	move() {
		if (this.state == 'IDLE') {
			if (this.idleTime == 0) {
				this.idleTime = painterIdleTime;
				
				let directionIdx = this.getDirection();
				if (directionIdx < 0) {
					this.state = 'STUCK';
					return;
				}
				let direction = painterDirections[directionIdx];
				let newDot = dots[this.currDot.i + direction[0]][this.currDot.j + direction[1]]
				newDot.painter = this;
				this.targetDot = newDot

				this.lastDirection = direction;

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
		} else if (this.state == 'STUCK') {
			return;
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
	
	let startingDots = [dots[2][2], dots[height - 3][2], dots[height-3][width-3], dots[2][width-3]]

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
