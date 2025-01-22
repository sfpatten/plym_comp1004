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

        // Encounters list
        this.encounters = [
            new Encounter(24, 24, "GameBox"),
            new Encounter(12, 24, "GameBox"),
            new Encounter(24, 12, "GameBox"),
            new Encounter(12, 12, "GameBox"),
            new Encounter(0, 24, "Calculator"),
            new Encounter(24, 0, "Optical Disk")
        ];
        // POIs - Points of Interest (things that do something when you try to walk into them)
        this.pois = [new POI(8, 8, "bed")];
    }

    generate(genType) {
        if (genType == "temp") {
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

    simulateAllEncounters() {
        for (let e = 0; e < this.encounters.length; e++) {
            this.encounters[e].takeTurn();
        }
    }

    clearDefeatedEncounters() {
        for (let e = this.encounters.length - 1; e >= 0; e--) {
            if (this.encounters[e].shouldDelete) {
                this.encounters.splice(e, 1);
            }
            this.renderOntoOverworldTable();
        }
    }
}

class Encounter {
    constructor(xpos, ypos, type) {
        this.xpos = xpos;
        this.ypos = ypos;
        this.type = type; // Enemy type it spawns in battle
        this.displaySymbol = type[0];
        this.shouldDelete = false; // Used so that the game can remove it if it has been defeated
    }

    move(dir) {
        switch (dir) {
            case 'U':
                if (this.ypos > 0 && game.overworld.levelGrid[this.xpos][this.ypos - 1] == "0") {
                    this.ypos -= 1;
                }
                break;
            case 'D':
                if (this.ypos < game.overworld.size - 1 && game.overworld.levelGrid[this.xpos][this.ypos + 1] == "0") {
                    this.ypos += 1;
                }
                break;
            case 'L':
                if (this.xpos > 0 && game.overworld.levelGrid[this.xpos - 1][this.ypos] == "0") {
                    this.xpos -= 1;
                }
                break;
            case 'R':
                if (this.xpos < game.overworld.size - 1 && game.overworld.levelGrid[this.xpos + 1][this.ypos] == "0") {
                    this.xpos += 1;
                }
                break;
        }

    }

    takeTurn() {
        if (Math.random() < 0.1) {
            return;
        }
        let xdiff = game.player.xpos - this.xpos;
        let ydiff = game.player.ypos - this.ypos;
        if (Math.abs(xdiff) > 7 | Math.abs(ydiff) > 7) {
            let direction = Math.floor(Math.random() * 4);
            switch (direction) {
                case 0:
                    this.move('U');
                    break;
                case 1:
                    this.move('D');
                    break;
                case 2:
                    this.move('L');
                    break;
                case 3:
                    this.move('R');
                    break;
            }
        } else {
            if (xdiff == 0) {
                if (ydiff < 0) {
                    this.move('U');
                } else {
                    this.move('D');
                }
            } else if (ydiff == 0) {
                if (xdiff < 0) {
                    this.move('L');
                } else {
                    this.move('R');
                }
            } else {
                if (Math.abs(xdiff) > Math.abs(ydiff)) { // Move in x direction
                    if (xdiff < 0) {
                        this.move('L');
                    } else {
                        this.move('R');
                    }
                } else { // Move in y direction
                    if (ydiff < 0) {
                        this.move('U');
                    } else {
                        this.move('D');
                    }
                }
            }
        }
        if ( Math.abs(this.xpos - game.player.xpos) < 2 && Math.abs(this.ypos - game.player.ypos) < 2) {
            this.shouldDelete = true;
            game.overworld.clearDefeatedEncounters();
            game.startBattle(this.type);
        }
    }
}

class POI {
    constructor(xpos, ypos, type) {
        this.xpos = xpos;
        this.ypos = ypos;
        this.type = type;
        this.displaySymbol = "b";
        this.shouldDelete = false;
    }

    use() {
        if (this.type == "bed") {
            game.player.HP = game.player.maxHP;
            //TODO: put a message in the log upon use, set a robot with a dream of "rest"'s status to dream fulfilled
        }
    }
}