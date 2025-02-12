class Level {
    constructor(size) {
        this.size = size;
        this.spawnPoint = [1, 1];

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

        // Encounters list
        this.encounters = [];
        // POIs - Points of Interest (things that do something when you try to walk into them)
        this.pois = [];
    }

    generate(genType, params=[]) {
        this.encounters.length = 0; // This very upsetting line of code is what is used instead of a .clear() method for arrays
        this.pois.length = 0; // This very upsetting line of code is what is used instead of a .clear() method for arrays
        if (genType == "temp") {
            // Move the
            this.encounters = [
                new Encounter(24, 24, "GameBox"),
                new Encounter(12, 24, "GameBox"),
                new Encounter(24, 12, "GameBox"),
                new Encounter(12, 12, "GameBox"),
                new Encounter(0, 24, "Calculator"),
                new Encounter(24, 0, "Optical Disk")
            ];
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

        } else if (genType == "storage") {
            this.pois.push(new POI(12, 0, "exit"));
            // Fill entire map with blocks
            for (let x = 0; x < 25; x++) {
                for (let y = 0; y < 25; y++) {
                    this.levelGrid[x][y] = 1;
                }
            }

            // Add gaps for entrance and exit
            this.levelGrid[12][0] = 0;
            this.levelGrid[12][24] = 0;

            // Add a perimeter space
            for (let x = 1; x < 24; x++) {
                this.levelGrid[x][1] = 0;
                this.levelGrid[x][23] = 0;
            }
            for (let y = 2; y < 23; y++) {
                this.levelGrid[1][y] = 0;
                this.levelGrid[23][y] = 0;
            }

            // Add corridor
            for (let y = 2; y < 23; y++) {
                this.levelGrid[11][y] = 0;
                this.levelGrid[12][y] = 0;
                this.levelGrid[13][y] = 0;
            }

            // Split left half into "bricks"
            let brickRowHeight = 4 + Math.floor(Math.random() * 4);
            let prevRHeight = 1; // used to slice our block horizontally
            while(brickRowHeight < 20) {
                for (let x = 2; x < 11; x++) { // Cut it vertically
                    this.levelGrid[x][brickRowHeight] = 0;
                }
                // Pick a random location and then cut the resultant piece horizontally
                let brickSliceX = 4 + Math.floor(Math.random() * 4)
                for (let y = prevRHeight + 1; y < brickRowHeight; y++) {
                    this.levelGrid[brickSliceX][y] = 0;
                }
                prevRHeight = brickRowHeight;
                brickRowHeight += 3 + Math.floor(Math.random() * 4)
            }

            // Split right half into "bricks"
            brickRowHeight = 4 + Math.floor(Math.random() * 4);
            prevRHeight = 1;
            while(brickRowHeight < 20) {
                for (let x = 14; x < 23; x++) { // Cut it vertically
                    this.levelGrid[x][brickRowHeight] = 0;
                }
                // Pick a random location and then cut the resultant piece horizontally
                let brickSliceX = 16 + Math.floor(Math.random() * 4)
                for (let y = prevRHeight + 1; y < brickRowHeight; y++) {
                    this.levelGrid[brickSliceX][y] = 0;
                }
                prevRHeight = brickRowHeight;
                brickRowHeight += 3 + Math.floor(Math.random() * 4)
            }

            // Spawn some calculators in
            this.spawnEncountersRandomWithinBounds(["Calculator", "Calculator"], 11, 2, 13, 15)

            // And set the spawn point
            this.spawnPoint = [12, 24];
        } else if (genType == "narrow") {
            /* This generation algorithm is based upon a 5x5 grid. I decided to implement this using a partially
            pre-determined layout rather than create a maze generation algorithm for so small a grid. */

            // Fill each tile with 0
            for (let i = 0; i < 25; i++) {
                for (let j = 0; j < 25; j++) {
                    this.levelGrid[i][j] = 0;
                }
            }

            // Pick a layout to generate
            let layoutPick = Math.floor(Math.random() * 10);
            let layout = []
            /* Which kind of square a character maps to
            . - void
            C - corridor
            R - room
            E - entrance
            X - exit */
            switch (layoutPick) {
                case 0:
                    layout = [
                        ".X...",
                        ".CCC.",
                        ".RRC.",
                        ".CCC.",
                        ".E..."
                    ]
                    break;
                case 1:
                    layout = [
                        "..X..",
                        ".RCR.",
                        ".RCR.",
                        ".RCC.",
                        "...E."
                    ]
                    break;
                case 2:
                    layout = [
                        "...X.",
                        "..RC.",
                        "..RC.",
                        ".RRC.",
                        "ECCC."
                    ]
                    break;
                case 3:
                    layout = [
                        "..X..",
                        ".RCR.",
                        "RCCR.",
                        ".RCR.",
                        "..E.."
                    ]
                    break;
                case 4:
                    layout = [
                        "...CX",
                        ".CCC.",
                        ".CRR.",
                        "CCR..",
                        "E...."
                    ]
                    break;
                case 5:
                    layout = [
                        "X....",
                        "C....",
                        "C.R..",
                        "C.CCC",
                        "CCC.E"
                    ]
                    break;
                case 6:
                    layout = [
                        ".X...",
                        ".CCCC",
                        "..RRC",
                        "..CCC",
                        "..E.."
                    ]
                    break;
                case 7:
                    layout = [
                        ".X...",
                        "CCR..",
                        "CRRR.",
                        "CCCC.",
                        "...E."
                    ]
                    break;
                case 8:
                    layout = [
                        "CCCCX",
                        "C....",
                        "CCCR.",
                        "C.R..",
                        "E...."
                    ]
                    break;
                default:
                    layout = [
                        "..XR.",
                        ".CCCR",
                        "RC.R.",
                        ".CC..",
                        "..E.."
                    ]
                    break;
            }


            // Give a 50% chance to mirror said layout
            if (Math.random() > 0.5) {
                for (let i = 0; i < 5; i++) {
                    layout[i] = layout[i][4] + layout[i][3] + layout[i][2] + layout[i][1] + layout[i][0]
                }
            }

            // Place down the squares based on this
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    if (layout[j][i] == ".") {
                        continue;
                    } else if (layout[j][i] == "R") {
                        // Make horizontal walls
                        for (let a = i * 5; a < i * 5 + 5; a++) {
                            this.levelGrid[a][j * 5] = 1;
                            this.levelGrid[a][j * 5 + 4] = 1;
                        }
                        // Make vertical walls
                        for (let a = j * 5 + 1; a < j * 5 + 5; a++) {
                            this.levelGrid[i * 5][a] = 1;
                            this.levelGrid[i * 5 + 4][a] = 1;
                        }

                        // Pick a direction to make a door in
                        // Check left is corridor
                        if (i != 0 && layout[j][i - 1] != "." && layout[j][i - 1] != "R") {
                            this.levelGrid[i * 5][j * 5 + 2] = 0;
                        }
                        // Check right
                        if (i != 4 && layout[j][i + 1] != "." && layout[j][i + 1] != "R") {
                            this.levelGrid[i * 5 + 4][j * 5 + 2] = 0;
                        }
                        // Check up
                        if (j != 0 && layout[j - 1][i] != "." && layout[j - 1][i] != "R") {
                            this.levelGrid[i * 5 + 2][j * 5] = 0;
                        }
                        // Check down
                        if (j != 4 && layout[j + 1][i] != "." && layout[j + 1][i] != "R") {
                            this.levelGrid[i * 5 + 2][j * 5 + 4] = 0;
                        }

                        // Place enemy
                        //TODO: vary enemy placed when more enemies are implemented
                        this.spawnEncountersRandomWithinBounds(["Calculator"], i * 5, j * 5,
                            i * 5 + 4, j * 5 + 4)
                    } else { // C, X and E, which are all corridors
                        // Place in corners
                        this.levelGrid[i * 5][j * 5] = 1;
                        this.levelGrid[i * 5 + 4][j * 5] = 1;
                        this.levelGrid[i * 5][j * 5 + 4] = 1;
                        this.levelGrid[i * 5 + 4][j * 5 + 4] = 1;

                        // Left wall
                        if (i == 0 || layout[j][i - 1] == ".") {
                            this.levelGrid[i * 5][j * 5 + 1] = 1;
                            this.levelGrid[i * 5][j * 5 + 2] = 1;
                            this.levelGrid[i * 5][j * 5 + 3] = 1;
                        } else if (layout[j][i - 1] == "R") {
                            this.levelGrid[i * 5][j * 5 + 1] = 1;
                            this.levelGrid[i * 5][j * 5 + 3] = 1;
                        }

                        // Right wall
                        if (i == 4 || layout[j][i + 1] == ".") {
                            this.levelGrid[i * 5 + 4][j * 5 + 1] = 1;
                            this.levelGrid[i * 5 + 4][j * 5 + 2] = 1;
                            this.levelGrid[i * 5 + 4][j * 5 + 3] = 1;
                        } else if (layout[j][i + 1] == "R") {
                            this.levelGrid[i * 5 + 4][j * 5 + 1] = 1;
                            this.levelGrid[i * 5 + 4][j * 5 + 3] = 1;
                        }

                        // Up wall
                        if (j == 0 || layout[j - 1][i] == ".") {
                            this.levelGrid[i * 5 + 1][j * 5] = 1;
                            this.levelGrid[i * 5 + 2][j * 5] = 1;
                            this.levelGrid[i * 5 + 3][j * 5] = 1;
                        } else if (layout[j - 1][i] == "R") {
                            this.levelGrid[i * 5 + 1][j * 5] = 1;
                            this.levelGrid[i * 5 + 3][j * 5] = 1;
                        }

                        // Down wall
                        if (j == 4 || layout[j + 1][i] == ".") {
                            this.levelGrid[i * 5 + 1][j * 5 + 4] = 1;
                            this.levelGrid[i * 5 + 2][j * 5 + 4] = 1;
                            this.levelGrid[i * 5 + 3][j * 5 + 4] = 1;
                        } else if (layout[j + 1][i] == "R") {
                            this.levelGrid[i * 5 + 1][j * 5 + 4] = 1;
                            this.levelGrid[i * 5 + 3][j * 5 + 4] = 1;
                        }

                        // Special cases for entrance and exit tiles
                        if (layout[j][i] == "E") {
                            this.spawnPoint = [i * 5 + 2, j * 5 + 2]

                        } else if (layout[j][i] == "X") {
                            this.pois.push(new POI(i * 5 + 2, j * 5, "exit"))
                            this.levelGrid[i * 5 + 2][j * 5] = 0;
                        } else {
                            // Place enemy
                            //TODO: vary enemy placed when more enemies are implemented
                            if (Math.random() > 0.6) {
                                this.spawnEncountersRandomWithinBounds(["GameBox"], i * 5, j * 5,
                                    i * 5 + 4, j * 5 + 4)
                            }
                        }
                    }
                }
            }
        } else if (genType == "wide") {
            // Clear
            for (let i = 0; i < 25; i++) {
                for (let j = 0; j < 25; j++) {
                    this.levelGrid[i][j] = 0;
                }
            }

            // Create main corridor
            for (let y = 0; y < 25; y++) { // Vertical walls
                this.levelGrid[6][y] = 1;
                this.levelGrid[18][y] = 1;
            }
            for (let x = 7; x < 18; x++) {
                this.levelGrid[x][0] = 1;
                this.levelGrid[x][24] = 1;
            }
            // Exit point and spawn point
            this.levelGrid[12][0] = 0;
            this.levelGrid[12][24] = 0;
            this.pois.push(new POI(12, 0, "exit"));
            this.spawnPoint = [12, 24];

            // Spawn monsters in corridor
            this.spawnEncountersRandomWithinBounds(["Keyboard", "Keyboard", "Keyboard", "Optical Disk",
                "Optical Disk"], 7, 1, 17, 19)


            // Decide which rooms to do
            // 0 - None
            // 1 - Left
            // 2 - Right
            // 3 - Both
            let choice = Math.floor(Math.random() * 4);

            // Left room
            if (choice == 1 || choice == 3) {
                // Pick where the walls are going
                let topWallY = 1 + Math.floor(Math.random() * 8);
                let bottomWallY = 16 + Math.floor(Math.random() * 8);
                // Make the top and bottom walls
                for (let x = 0; x < 6; x++) {
                    this.levelGrid[x][topWallY] = 1;
                    this.levelGrid[x][bottomWallY] = 1;
                }
                for (let y = topWallY + 1; y < bottomWallY; y++) {
                    this.levelGrid[0][y] = 1;
                }

                // Make doorway
                let doorY = topWallY + 1 + Math.floor(Math.random() * (bottomWallY - topWallY - 1));
                this.levelGrid[6][doorY] = 0;

                // Determine whether any POIs are going to be added into the room
                let bonusFeature = Math.floor(Math.random() * 4);
                // 1 = Vending machine
                // 2 = Grill
                // 3 = Cactus
                if (bonusFeature != 0) {
                    let poiY = topWallY + 1 + Math.floor(Math.random() * (bottomWallY - topWallY - 1));
                    switch (bonusFeature) {
                        case 1:
                            this.pois.push(new POI(1, poiY, "vendingMachine"))
                            break;
                        case 2:
                            this.pois.push(new POI(1, poiY, "grill"))
                            break;
                        case 3:
                            this.pois.push(new POI(1, poiY, "cactus"))
                            break;
                    }
                }
                // Spawn room enemies
                this.spawnEncountersRandomWithinBounds(["GameBox"], 1, topWallY + 1
                    , 5, bottomWallY - 1);
            }

            // Right room
            if (choice == 2 || choice == 3) {
                // Pick where the walls are going
                let topWallY = 1 + Math.floor(Math.random() * 8);
                let bottomWallY = 16 + Math.floor(Math.random() * 8);
                // Make the top and bottom walls
                for (let x = 19; x < 25; x++) {
                    this.levelGrid[x][topWallY] = 1;
                    this.levelGrid[x][bottomWallY] = 1;
                }
                for (let y = topWallY + 1; y < bottomWallY; y++) {
                    this.levelGrid[24][y] = 1;
                }

                // Make doorway
                let doorY = topWallY + 1 + Math.floor(Math.random() * (bottomWallY - topWallY - 1));
                this.levelGrid[18][doorY] = 0;

                // Determine whether any POIs are going to be added into the room
                let bonusFeature = Math.floor(Math.random() * 4);
                // 1 = Vending machine
                // 2 = Grill
                // 3 = Cactus
                if (bonusFeature != 0) {
                    let poiY = topWallY + 1 + Math.floor(Math.random() * (bottomWallY - topWallY));
                    switch (bonusFeature) {
                        case 1:
                            this.pois.push(new POI(23, poiY, "vendingMachine"))
                            break;
                        case 2:
                            this.pois.push(new POI(23, poiY, "grill"))
                            break;
                        case 3:
                            this.pois.push(new POI(23, poiY, "cactus"))
                            break;
                    }
                }
                // Spawn room enemies
                this.spawnEncountersRandomWithinBounds(["GameBox"], 19, topWallY + 1
                    , 23, bottomWallY - 1);
            }
        }
    }

    spawnEncounterAt(encounterType, x, y) {
        this.encounters.push(new Encounter(x, y, encounterType));
    }

    // A method to randomly spawn encounters within certain bounds
    spawnEncountersRandomWithinBounds(encountersToPlace, xmin, ymin, xmax, ymax) {
        // Find valid tiles within this location, relative to x and ymin
        let validPositions = [];
        for (let x = xmin; x < xmax; x++) {
            for (let y = ymin; y < ymax; y++) {
                if (this.levelGrid[x][y] == 0) {
                    validPositions.push([x, y]);
                }
            }
        }

        // Iterate through the list of encounters, putting them in a random valid spot
        for (let e = 0; e < encountersToPlace.length; e++) {
            let pick = validPositions[Math.floor(Math.random() * validPositions.length)];
            this.encounters.push(new Encounter(pick[0], pick[1], encountersToPlace[e]));
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
        this.displaySymbol = type[0];
    }

    use() {
        if (this.type = "exit") {
            game.overworldLevelUp();
        } else if (this.type == "bed") {
            game.player.HP = game.player.maxHP;
            //TODO: put a message in the log upon use, set a robot with a dream of "rest"'s status to dream fulfilled
        }
    }
}