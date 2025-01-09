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
        this.generate("temp");
    }

    generate(type) {
        if (type = "temp") {
            // temp - add two random horizontal and one veritcal wall
            for (let i =0; i < 2; i++) {
                let y = Math.floor(Math.random() * (this.size - 4)) + 2;
                for (let x = 0; x < this.size; x++) {
                    if (Math.random() > 0.5) {
                        this.levelGrid[x][y] = 1;
                    }
                }
            }
            let x = Math.floor(Math.random() * (this.size - 4)) + 2;
                for (let y = 0; y < this.size; y++) {
                    if (Math.random() > 0.25) {
                        this.levelGrid[x][y] = 1;
                    }
                }

        }
    }

    renderOntoOverworldTable() {
        let theTable = document.getElementById("overworld-map-display");
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                theTable.rows[i].cells[j].innerHTML = this.levelGrid[j][i];
            }
        }
    }
}

class Game {
    constructor() {
        this.botNumber = 0;
        this.overworld = new Level(15);
        this.player = new Player();
    }
}

class Player {
    constructor() {
        this.xpos = 0;
        this.ypos = 0;
    }
}

function generateNewTable(n) {
    // delete old table rows (overarching table does not get destroyed)
    let oldTableLen = document.getElementById("overworld-map-display").rows.length;
    for (let i = 0; i < oldTableLen; i++) {
        document.getElementById("overworld-map-display").deleteRow(0);
    }

    // create new table
    let currentRow = null;
    let currentCell = null;
    for (let i = 0; i < n; i++) {
        currentRow = document.createElement("tr");
        for (let j = 0; j < n; j++) {
            currentCell = document.createElement("td");
            currentCell.innerHTML = "#";
            currentRow.appendChild(currentCell);
        }
        document.getElementById("overworld-map-display").appendChild(currentRow);
    }


}

function render() {
    // first we render the overworld
    game.overworld.renderOntoOverworldTable(); // this will change based on where we are when there are multiple Level classes to traverse in future, but for now, one is enough.

    // now the player
        // note - it assumes the player is within bounds of the map, if it is not, it will come up with an exception
    document.getElementById("overworld-map-display").rows[game.player.ypos].cells[game.player.xpos].innerHTML = "@";

}

function movePlayerTemp(dir) { // a temporary function
    // TODO: implement a switch case
    if (dir == 'U') {
        if (game.player.ypos > 0) {
            game.player.ypos -= 1;
        }
    } else if (dir == 'D') {
        if (game.player.ypos < game.overworld.size - 1) {
            game.player.ypos += 1;
        }
    } else if (dir == 'L') {
        if (game.player.xpos > 0) {
            game.player.xpos -= 1;
        }
    } else if (dir == 'R') {
        if (game.player.xpos < game.overworld.size - 1) {
            game.player.xpos += 1;
        }
    }
    render();
}

let game = new Game();

generateNewTable(15);
render();
