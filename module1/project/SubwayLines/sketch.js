let dots = []; // a 2D array with height rows and width cols containing Dot objects

let width = 0; // in dots (to be initialized in setup)
let height = 0; // in dots (to be initialized in setup)

// GLOBAL PARAMETERS
let spaceBetweenDots = 50;
let dotDiameter = 10;

let numPainters = 4;
let painters = [];
let painterDotDiameter = 20;
let painterIdleTime = 10;
let lerpSpeed = 0.05;
let painterStrokeWeight = 8;
let painterDotOpacity = 170;
let painterDirections = [[1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]
let transportSpeed = 0.05;

let colorPalette = [[1, 41, 95], [132, 147, 36], [255, 179, 15], [253, 21, 27]];


// A dot representing a location on the grid to which the painters can travel to
class Dot {
	constructor(x,y, i, j) {
		this.x = x;
		this.y = y;
		this.i = i; // the row that this dot belongs to in dots[]
		this.j = j; // the col that this dot belongs to in dots[]
		this.painter = null; // the painter that this dot belongs to (null if it is painterless)
	}

	display() {
		fill(201, 197, 177);
		circle(this.x, this.y, dotDiameter);
	}
}

// A subway line (I originally called it painter since I wasn't sure what to call it oops) that is displayed as a colorful line
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
		this.dotDiameter = painterDotDiameter;
		startingDot.painter = this;

		this.transportDotX = startingDot.x;
		this.transportDotY = startingDot.y;
		this.transportLerp = 0;
		this.transportIdx = 0;
		this.targetDot = this.pDots[1];
		this.transportDirection = 1;
	}

	// gets the next valid direction for the painter to move in, returns -1 if no valid direction available
	getDirection() {
		let possibleIndices = []
		for (let i = 0; i < painterDirections.length; i++) {
			let possibleDirection = painterDirections[i]
			if (this.currDot.i + possibleDirection[0] < height && this.currDot.i + possibleDirection[0] >= 0 && this.currDot.j + possibleDirection[1] < width && this.currDot.j + possibleDirection[1] >= 0) {
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

	// the state machine that performs an animation or movement based on what state the painter is in
	move() {
		if (this.state == 'IDLE') {
			if (this.idleTime == 0) {
				this.idleTime = painterIdleTime;
				
				let directionIdx = this.getDirection();
				if (directionIdx < 0) {
					this.state = 'SHRINKING';
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
				// smooth decelerating motion with lerp
				this.phantomDotX = lerp(this.phantomDotX, this.targetDot.x, this.movingLerp)
				this.phantomDotY = lerp(this.phantomDotY, this.targetDot.y, this.movingLerp)
				this.movingLerp += lerpSpeed;
			}
		} else if (this.state == 'SHRINKING') {
			if (this.dotDiameter == 0) {
				this.state = 'TRANSPORTING';
				return;
			} else {
				this.dotDiameter -= 0.5;
			}
		} else if (this.state == 'TRANSPORTING') {
			if (this.transportLerp >= 1) {
				this.transportLerp = 0;
				this.transportIdx += this.transportDirection;
				if (this.transportIdx == this.pDots.length - 1|| this.transportIdx == 0) {
					this.transportDirection *= -1;
				}
			}

			// constant linear motion with lerp
			this.transportDotX = lerp(this.pDots[this.transportIdx].x, this.pDots[this.transportIdx + this.transportDirection].x, this.transportLerp);
			this.transportDotY = lerp(this.pDots[this.transportIdx].y, this.pDots[this.transportIdx + this.transportDirection].y, this.transportLerp);
			this.transportLerp += transportSpeed;
			
			return;
		}
	}

	display() {
		fill(this.r, this.g, this.b, painterDotOpacity);
		noStroke();
		for (let i = 0; i < this.pDots.length - 1; i++) {
			noStroke();
			circle(this.pDots[i].x, this.pDots[i].y, this.dotDiameter);
			strokeWeight(painterStrokeWeight);
			stroke(this.r, this.g, this.b, painterDotOpacity);
			line(this.pDots[i].x, this.pDots[i].y, this.pDots[i+1].x, this.pDots[i+1].y)
		}
		noStroke();
		circle(this.pDots[this.pDots.length-1].x, this.pDots[this.pDots.length-1].y, this.dotDiameter);
		if (this.state == 'MOVING') {
			strokeWeight(painterStrokeWeight)
			stroke(this.r, this.g, this.b, painterDotOpacity)
			line(this.pDots[this.pDots.length-1].x, this.pDots[this.pDots.length-1].y, this.phantomDotX, this.phantomDotY)
			noStroke()
			circle(this.phantomDotX, this.phantomDotY, this.dotDiameter)
		}

		if (this.state == 'TRANSPORTING') {
			circle(this.transportDotX, this.transportDotY, painterDotDiameter)
		}

	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	
	// to scale to different screen sizes, I clamped the true space between dots to be between 40 and some number scaled to the min of width and height
	let scaledSpaceBetweenDots = max(40,spaceBetweenDots * (min(windowWidth, windowHeight)/800))

	// the number of dots is just determined by how many dots the window can hold with the new scaled spacing, since we want to fill the entire window
	width = Math.floor(windowWidth / scaledSpaceBetweenDots);
	height = Math.floor(windowHeight / scaledSpaceBetweenDots);
	for (let i = 0; i < height; i++) {
		let row = [];
		for (let j = 0; j < width; j++) {
			row.push(new Dot(j * scaledSpaceBetweenDots, i * scaledSpaceBetweenDots, i, j));
		}
		dots.push(row);
	}
	
	// randomly determine the 4 starting locations of the 4 painters/subways, where each will be sampled from a unique quadrant of the window
	let startingDots = []
	let s1 = [Math.floor(random(1,Math.floor(height/2))), Math.floor(random(1, Math.floor(width/2)))]
	let s2 = [Math.floor(random(1,Math.floor(height/2))), Math.floor(random(Math.floor(width/2) + 1, width - 1))]
	let s3 = [Math.floor(random(Math.floor(height/2) + 1, height - 1)), Math.floor(random(1, Math.floor(width/2)))]
	let s4 = [Math.floor(random(Math.floor(height/2) + 1, height - 1)), Math.floor(random(Math.floor(width/2) + 1, width - 1))]
	startingDots.push(dots[s1[0]][s1[1]])
	startingDots.push(dots[s2[0]][s2[1]])
	startingDots.push(dots[s3[0]][s3[1]])
	startingDots.push(dots[s4[0]][s4[1]])

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
