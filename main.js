// document.getElementById("temp").innerHTML = "JS is working.";

class Level {
    constructor(size) {
        this.size = size;

        // set up the level grid
        this.levelGrid = new Array(size); // make the thing
            // populate each first dimension with its own new array
        for (let i = 0; i < size; i++) {
            this.levelGrid[i] = new Array(size);
        }
            // fill each tile with 0
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                this.levelGrid[i][j] = 0;
            }
        }

    }
}

class Game {
    constructor() {
        this.botNumber = 0;
        this.overworld = new Level(50);
    }
}

let game = new Game();
