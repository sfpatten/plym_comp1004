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
                if (this.levelGrid[j][i] == 1) {
                    theTable.rows[i].cells[j].innerHTML = "#";
                    theTable.rows[i].cells[j].className = "overworld-map-box";
                } else {
                    theTable.rows[i].cells[j].innerHTML = ".";
                    theTable.rows[i].cells[j].className = "overworld-map-box-grey";
                }
            }
        }
    }
}

class Game {
    constructor() {
        this.botNumber = 0;
        this.overworld = new Level(25);
        this.player = new Player();
        this.mode = "overworld";
    }

    setMode(newMode) {
        // i need to make a method that hides EVERYTHING and then unhides the correct thing
        document.getElementById("overworld-grid").style.display="none";
        document.getElementById("battle-box").style.display="none";
        if (newMode == "overworld") {
            document.getElementById("overworld-grid").style.display="grid";
            this.mode = "overworld";
        } else if (newMode == "battle") {
            document.getElementById("battle-box").style.display="block";
        }
    }
}

class Player {
    constructor() {
        this.xpos = 0;
        this.ypos = 0;
    }

    move(dir) {
        switch (dir) {
            case 'U':
                if (game.player.ypos > 0 && game.overworld.levelGrid[this.xpos][this.ypos - 1] == "0") {
                    game.player.ypos -= 1;
                }
                break;
            case 'D':
                if (game.player.ypos < game.overworld.size - 1 && game.overworld.levelGrid[this.xpos][this.ypos + 1] == "0") {
                    game.player.ypos += 1;
                }
                break;
            case 'L':
                if (game.player.xpos > 0 && game.overworld.levelGrid[this.xpos - 1][this.ypos] == "0") {
                    game.player.xpos -= 1;
                }
                break;
            case 'R':
                if (game.player.xpos < game.overworld.size - 1 && game.overworld.levelGrid[this.xpos + 1][this.ypos] == "0") {
                    game.player.xpos += 1;
                }
                break;
        }
        render();
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
            currentCell.innerHTML = "?";
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
    document.getElementById("overworld-map-display").rows[game.player.ypos].cells[game.player.xpos].innerHTML = "<b>@</b>";
    document.getElementById("overworld-map-display").rows[game.player.ypos].cells[game.player.xpos].className = "overworld-map-box";

}


function onKeyDown(e) {
    // TODO: make this only happen for overworld mode when more than just overworld mode exists
    if (game.mode != "overworld") {
        return;
    }
    switch (e.code) {
        // Arrow keys
        case "ArrowUp":
            game.player.move('U');
            break;
        case "ArrowDown":
            game.player.move('D');
            break;
        case "ArrowLeft":
            game.player.move('L');
            break;
        case "ArrowRight":
            game.player.move('R');
            break;
        // WASD keys
        case "KeyW":
            game.player.move('U');
            break;
        case "KeyS":
            game.player.move('D');
            break;
        case "KeyA":
            game.player.move('L');
            break;
        case "KeyD":
            game.player.move('R');
            break;
    }
}

let game = new Game();

generateNewTable(25);
render();

document.addEventListener("keydown", onKeyDown);

game.setMode("battle");
