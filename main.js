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
            new Encounter(0, 24, "Calculator"),
            new Encounter(24, 0, "Optical Disk")
        ];
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

class Game {
    constructor() {
        this.botNumber = 0;
        this.spareBots = [ // A temporary list of instantiated SpareBots
            new SpareBot("Chappell Roan", 20, 4, 6, 8, 2, 5, "friendship", "apple"),
            new SpareBot("Cecil Baldwin", 20, 1, 9, 6, 3, 6, "friendship", "biscuit"),
            new SpareBot("Robot 3", 20, 5, 5, 2, 11, 2, "revenge", "teabag"),
            new SpareBot("Peter Lukas from The Magnus Archives", 20, 3, 7, 1, 4, 10, "money", "soap"),
        ];
        this.overworld = new Level(25);
        this.player = new Player();
        this.mode = "overworld";
        this.battle = null;
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

    startBattle(enemyType) {
        this.setMode("battle");
        this.battle = new Battle(enemyType);
        this.battle.start();
    }

    robotDied() {
        if (this.botNumber < 4) {
            // TODO: death popup window
            this.player.name = this.spareBots[0].name;
            this.player.maxHP = this.spareBots[0].maxHP;
            this.player.HP = this.spareBots[0].maxHP;
            this.player.str = this.spareBots[0].str;
            this.player.arm = this.spareBots[0].arm;
            this.player.dex = this.spareBots[0].dex;
            this.player.int = this.spareBots[0].int;
            this.player.cha = this.spareBots[0].cha;
            this.player.dream = this.spareBots[0].dream;
            this.player.favFood = this.spareBots[0].favFood;
            this.botNumber++;
            this.spareBots.splice(0, 1);
        } else { // game over - to do
            console.log("game over");
        }
    }
}

class Entity {
    constructor() {
        this.xpos = 0;
        this.ypos = 0;
        this.maxHP = 10;
        this.HP = this.maxHP;
        // Stats - the stat is acquired with a roll.
        this.str = 0; // Strength - how much damage is dealt
        this.arm = 0; // Armour (basically constitution) - how well you can defend against attacks
        this.dex = 0; // Dexterity - speed
        this.int = 0; // Intelligence (merged with TTRPG Wisdom)
        this.cha = 0; // Charm (TTRPG Charisma)
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

    rollStr() {
        return Math.floor(Math.random() * 6) + this.str;
    }

    rollArm() {
        return Math.floor(Math.random() * 6) + this.arm;
    }

    rollDex() {
        return Math.floor(Math.random() * 6) + this.dex;
    }

    rollInt() {
        return Math.floor(Math.random() * 6) + this.int;
    }

    rollCha() {
        return Math.floor(Math.random() * 6) + this.cha;
    }
}

class Player extends Entity {
    constructor() {
        super();
        this.name = "Robot 1";
        this.str = 5;
        this.arm = 5;
        this.maxHP = 20;
        this.HP = 20;
        this.inventory = [new Item("apple", 2), new Item("toast", 1), new Item("raisins", 1)];
        this.dream = "friendship";
        this.favFood = "apple";
    }
}

class Enemy extends Entity {
    constructor(type) {
        super();
        this.type = type;
        switch (this.type) {
            case "Calculator":
                this.maxHP = 8;
                this.str = 1;
                this.arm = 0;
                break;
            case "Floppy Disk":
                this.maxHP = 5;
                this.str = 1;
                this.arm = 0;
                break;
            case "GameBox":
                this.maxHP = 20;
                this.str = 4;
                this.arm = 0;
                break;
            case "Optical Disk": {
                this.maxHP = 30;
                this.str = 3;
                this.arm = 0;
            }
        }
        this.HP = this.maxHP; // set their HP to full
    }
}

class SpareBot { // A separate class to reduce memory usage - they would be structs if they existed in JS, hence not appearing on class diagrams
    constructor(name, maxHP, str, arm, dex, int, cha, dream, favFood) {
        this.name = name;
        this.maxHP = maxHP;
        this.str = str;
        this.arm = arm;
        this.dex = dex;
        this.int = int;
        this.cha = cha;
        this.dream = dream;
        this.favFood = favFood;
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

// Setup
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

// UI
function renderMap() {
    // first we render the overworld
    game.overworld.renderOntoOverworldTable(); // this will change based on where we are when there are multiple Level classes to traverse in future, but for now, one is enough.


    // then encounters
    for (let e = 0; e < game.overworld.encounters.length; e++) {
        let x = game.overworld.encounters[e].xpos;
        let y = game.overworld.encounters[e].ypos;
        document.getElementById("overworld-map-display").rows[y].cells[x].innerHTML = "<b>" + game.overworld.encounters[e].displaySymbol + "</b>";
        document.getElementById("overworld-map-display").rows[y].cells[x].className = "overworld-map-box";
    }

    // now the player
        // note - it assumes the player is within bounds of the map, if it is not, it will come up with an exception
    document.getElementById("overworld-map-display").rows[game.player.ypos].cells[game.player.xpos].innerHTML = "<b>@</b>";
    document.getElementById("overworld-map-display").rows[game.player.ypos].cells[game.player.xpos].className = "overworld-map-box";
}

function updateInventoryDisplay() {
    for (let i = 0; i < 8; i++) {
        if (i < game.player.inventory.length) {
            document.getElementById("inv-td-i" + i).innerHTML = game.player.inventory[i].displayName + " x" + game.player.inventory[i].count;
            document.getElementById("inv-td-b" + i).style.display = "inline-block";
        } else {
            document.getElementById("inv-td-i" + i).innerHTML = "";
            document.getElementById("inv-td-b" + i).style.display = "none";
        }

    }
}

// Input handling
function onKeyDown(e) {
    if (game.mode == "overworld") {
        let success = true;
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
            default:
                success = false; // we don't want to send an overworld update if no valid key was pressed'
        }
        if (success) {
            game.overworld.simulateAllEncounters();
            renderMap();
        }
    } else if (game.mode == "battle") {
        // TODO: contain this in a battle function
        if (game.battle.battleFrames > 0) {
            switch (e.code) {
                case "ArrowUp":
                    keysDown[0] = true;
                    break;
                case "ArrowDown":
                    keysDown[1] = true;
                    break;
                case "ArrowLeft":
                    keysDown[2] = true;
                    break;
                case "ArrowRight":
                    keysDown[3] = true;
                    break;
                // WASD keys
                case "KeyW":
                    keysDown[0] = true;
                    break;
                case "KeyS":
                    keysDown[1] = true;
                    break;
                case "KeyA":
                    keysDown[2] = true;
                    break;
                case "KeyD":
                    keysDown[3] = true;
                    break;
            }
        }
    }
}

function onKeyUp(e) {
    if (game.mode == "battle") {
        // TODO: contain this in a battle function
        if (game.battle.battleFrames > 0) {
            switch (e.code) {
                case "ArrowUp":
                    keysDown[0] = false;
                    break;
                case "ArrowDown":
                    keysDown[1] = false;
                    break;
                case "ArrowLeft":
                    keysDown[2] = false;
                    break;
                case "ArrowRight":
                    keysDown[3] = false;
                    break;
                // WASD keys
                case "KeyW":
                    keysDown[0] = false;
                    break;
                case "KeyS":
                    keysDown[1] = false;
                    break;
                case "KeyA":
                    keysDown[2] = false;
                    break;
                case "KeyD":
                    keysDown[3] = false;
                    break;
            }
        }
    }
}

function battleActionButton(action) {
    if (game.mode = "battle") {
        if (action == 1) {
            game.battle.playerAttack();
        } else if (action == 2) {
            game.battle.displayBattleInventory()
        } else if (action == 3) {
            game.battle.hideBattleInventory()
        }
    }
}

function inventoryButton(num) {
    console.log("Not implemented yet");
}

function battleInventoryButton(num) {
    if (num < game.player.inventory.length) {
        game.battle.playerUseItem(num);
    }
}

function resetKeysDown() {
    for (let x = 0; x < 4; x++) {
        keysDown[x] = false;
    }
}

let game = new Game();

let keysDown = [false, false, false, false];

// Setup
generateNewTable(25);
renderMap();
updateInventoryDisplay();

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);



// Immediately start a battle for testing
//game.startBattle("GameBox");
