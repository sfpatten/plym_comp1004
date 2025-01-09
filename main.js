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
}

class Battle {
    constructor(enemyType) {
        this.enemy = new Enemy(enemyType);
        this.waitingForPlayer = false;
        this.battleFrames = 0; // frames left of battle
        this.timeout = null;
        this.playerPosX = 0;
        this.playerPosY = 0;
        this.playerVelX = 0;
        this.playerVelY = 0;
        this.playerImmunityFrames = 0;
        this.bullets = [];
    }

    start() {
        this.updateHPDisplays();
        this.updateNameDisplays();
        this.playerTurnStart();
        resetKeysDown();
    }

    updateHPDisplays() {
        document.getElementById("battle-player-status").innerHTML = "HP: " + game.player.HP + "/" + game.player.maxHP;
        document.getElementById("battle-enemy-status").innerHTML = "HP: " + this.enemy.HP + "/" + this.enemy.maxHP;
    }

    updateNameDisplays() {
        document.getElementById("battle-player-name").innerHTML =  game.player.name;
        document.getElementById("battle-enemy-name").innerHTML = this.enemy.type;
        document.getElementById("battle-enemy").innerHTML = this.enemy.type[0];
    }

    playerTurnStart() {
        // clear bullets
        // remove each div
        for (let bulletNumber = 0; bulletNumber < game.battle.bullets.length; bulletNumber++) {
                game.battle.bullets[bulletNumber].deleteRender();
            }
        this.bullets = []; // clear array

        // hide monster attack stuff
        document.getElementById("battle-board").style.display="none";
        document.getElementById("battle-soul").style.display="none";
        // display action buttons
        document.getElementById("battle-actions").style.display="block";
        document.getElementById("battle-player").style.display="block";
    }

    playerAttack() {
        let damage = game.player.rollStr();
        damage -= this.enemy.rollArm();
        if (damage < 1) {
            damage = 1;
        }
        this.enemy.HP -= damage;
        this.updateHPDisplays();

        this.enemyTurnStart();
    }

    enemyAttack() {
        if (this.playerImmunityFrames > 0) {
            return;
        }
        let damage = this.enemy.rollStr();
        damage -= game.player.rollArm();
        if (damage < 1) {
            damage = 1;
        }
        game.player.HP -= damage;
        this.playerImmunityFrames = 20;
    }

    enemyTurnStart() {
        this.playerPosX = 45;
        this.playerPosY = 45;
        this.playerVelX = 0;
        this.playerVelY = 0;

        this.battleFrames = 0;

        this.updatePlayerPos();

        // show monster attack stuff
        document.getElementById("battle-board").style.display="block";
        document.getElementById("battle-soul").style.display="block";
        // hide action buttons
        document.getElementById("battle-actions").style.display="none";
        document.getElementById("battle-player").style.display="none";
        this.timeout = setTimeout(this.runDefendFrame, 50);


        // TEMP: bullet pattern
        //for (let x = 0; x < 8; x++) {
        //    this.bullets.push(new Bullet(20 + x * 10 ,x * -5 - 80, 0, 2, "standard", "?", x * 45, 5));
        //}

        //for (let x = 0; x < 8; x++) {
        //    this.bullets.push(new Bullet(70 - x * 10 ,x * -5 - 180, 0, 2, "standard", "?", x * 45, 5));
        //}

        //for (let x = 0; x < 8; x++) {
        //    this.bullets.push(new Bullet(20 + x * 10 ,x * -5 - 280, 0, 2, "standard", "?", x * 45, 5));
        //}

        //for (let x = 0; x < 8; x++) {
        //    this.bullets.push(new Bullet(70 - x * 10 ,x * -5 - 380, 0, 2, "revolving", "?", x * 45, 5));
        //}

        //for (let x = 0; x < 8; x++) {
        //    this.bullets.push(new Bullet(20 + x * 10 ,x * -5 - 480, 0, 2, "standard", "?", x * 45, 5));
        //}

        //for (let x = 0; x < 8; x++) {
        //    this.bullets.push(new Bullet(70 - x * 10 ,x * -5 - 580, 0, 2, "standard", "?", x * 45, 5));
        //}

        // temporary battle pattern picker
        let myOption = Math.floor(Math.random() * 3)
        switch (myOption) {
            case 0:
                this.battleFrames = 400;
                for (let x = 0; x < 20; x++) {
                    let r = 10 + Math.random() * 80
                    let spd = 1 + Math.random() * 3
                    for (let y = 0; y < 6; y++) {
                        this.bullets.push(new Bullet(-140 - x*60, r, spd, 0, "revolving", "?", y * 60, spd));
                    }
                }
                break;
            case 1:
                this.battleFrames = 280;
                for (let x = 0; x < 50; x++) {
                    let r = Math.random() * 100
                    this.bullets.push(new Bullet(200 - x * -20, r, -5, 0, "standard", "baskintheresplendentgloryofthesun'slife-givingrays"[x], 0, 0));
                }
                break;
            case 2:
                this.battleFrames = 400;
                for (let x = 0; x < 12; x++) {
                    let r = Math.random() * 100
                    this.bullets.push(new Bullet(200 - x * -80, r, -3, 0, "standard", "x", 0, 0));
                }
                for (let x = 0; x < 12; x++) {
                    let r = Math.random() * 100
                    this.bullets.push(new Bullet(-200 - x * 80, r, 3, 0, "standard", "x", 0, 0));
                }
                for (let x = 0; x < 12; x++) {
                    let r = Math.random() * 100
                    this.bullets.push(new Bullet(r, 200 + x * 80, 0, -3, "standard", "x", 0, 0));
                }
                for (let x = 0; x < 12; x++) {
                    let r = Math.random() * 100
                    this.bullets.push(new Bullet(r, -200 - x * 80, 0, 3, "standard", "x", 0, 0));
                }
                break;
        }
    }

    runDefendFrame() {
        // NOTE: because of JS's quirks, the "this" keyword does not work, hence the constant convoluted self-referencing.
        if (game.battle.battleFrames > 1) {
            game.battle.updateHPDisplays();

            // simulate player
            if (keysDown[0]) {
                game.battle.playerVelY -= 1
            }
            if (keysDown[1]) {
                game.battle.playerVelY += 1
            }
            if (keysDown[2]) {
                game.battle.playerVelX -= 1
            }
            if (keysDown[3]) {
                game.battle.playerVelX += 1
            }

                // update player's position and velocity
            game.battle.playerPosX += game.battle.playerVelX;
            game.battle.playerPosY += game.battle.playerVelY;

            game.battle.playerVelX *= 0.5;
            game.battle.playerVelY *= 0.5;

                // wall collision
            if (game.battle.playerPosX < 0) {
                game.battle.playerPosX = 0;
                game.battle.playerVelX = 0;
            } else if (game.battle.playerPosX > 90) {
                game.battle.playerPosX = 90;
                game.battle.playerVelX = 0;
            }
            if (game.battle.playerPosY < 0) {
                game.battle.playerPosY = 0;
                game.battle.playerVelY = 0;
            } else if (game.battle.playerPosY > 90) {
                game.battle.playerPosY = 90;
                game.battle.playerVelY = 0;
            }
                // update their position
            game.battle.updatePlayerPos();
                // decrement immunity frames
            if (game.battle.playerImmunityFrames > 0) {
                game.battle.playerImmunityFrames--;
            }

            // Bullets
            for (let bulletNumber = game.battle.bullets.length - 1; bulletNumber > -1; bulletNumber--) {
                game.battle.bullets[bulletNumber].simulate();
                game.battle.bullets[bulletNumber].render();
            }

            for (let bulletNumber = game.battle.bullets.length - 1; bulletNumber > -1; bulletNumber--) {
                if (game.battle.bullets[bulletNumber].shouldDelete) {
                    game.battle.bullets[bulletNumber].deleteRender();
                    game.battle.bullets.splice(bulletNumber, 1);
                }
            }

            // schedule next frame
            game.battle.battleFrames -= 1;
            game.battle.timeout = setTimeout(game.battle.runDefendFrame, 25);
        } else {
            game.battle.playerTurnStart();
        }
    }

    end() {
        game.setMode("overworld");
        // TODO: add functionality for this
    }

    updatePlayerPos() {
        let vwx = 40 + (game.battle.playerPosX / 5)
        let vwy = 5 + (game.battle.playerPosY / 5)

        document.getElementById("battle-soul").style.left = vwx.toString() + "vw";
        document.getElementById("battle-soul").style.top = vwy.toString() + "vw";
    }
}

class Bullet {
    constructor(xp, yp, xv, yv, type, sym, rt, rv) {
        this.xpos = xp;
        this.ypos = yp;
        this.xvel = xv;
        this.yvel = yv;
        this.type = type;
        this.symbol = sym;
        this.shouldDelete = false;
        this.rotation = rt;
        this.rotvel = rv;


        if (this.type == "standard") {
            this.size = 20;
        } else if (this.type == "big") {
            this.size = 40;
        } else if (this.type == "revolving") {
            this.size = 20;
            this.xcpos = xp; // needed to differentiate the center from the relative position
            this.ycpos = yp;
        } else if (this.type == "small-revolving") {
            this.size = 10;
            this.xcpos = xp; // needed to differentiate the center from the relative position
            this.ycpos = yp;
        }

        // create rendered element
        this.bulletDiv = document.createElement("div");
        this.bulletDiv.innerHTML = sym;
        this.bulletDiv.className = "battle-bullet";

        // render based on size - this doesn't change by frame
        this.bulletDiv.style.width = (this.size / 5).toString() + "vw";
        this.bulletDiv.style.height = (this.size / 5).toString() + "vw";
        this.bulletDiv.style.fontSize = (this.size / 6.6).toString() + "vw";

        // add to document
        document.getElementById("battle-box").appendChild(this.bulletDiv);
        this.render();


    }

    simulate() {
        if (this.type == "standard" | this.type == "big") {
            this.xpos += this.xvel;
            this.ypos += this.yvel;
            this.rotation += this.rotvel;

        } else if (this.type == "revolving" | this.type == "small-revolving") {
            let space_factor = this.size;

            if (this.type == "small-revolving") {
                space_factor = this.size * 2;
            } else {
                space_factor = this.size;
            }

            this.xcpos += this.xvel;
            this.ycpos += this.yvel;
            this.rotation += this.rotvel;

            // to circle around point (i, j) at angle in radians t, x= i + cos t and y = j + sin t. angles in degrees are much nicer to work in, so we convert here.
            this.xpos = this.xcpos + space_factor * Math.sin(this.rotation * -0.017);
            this.ypos = this.ycpos + space_factor * Math.cos(this.rotation * -0.017);

        }

        let xdiff = (this.xpos + (this.size / 2)) - (game.battle.playerPosX + 5);
        let ydiff = (this.ypos + (this.size / 2)) - (game.battle.playerPosY + 5);
        if (xdiff**2 + ydiff**2 < this.size) {
            this.shouldDelete = true;
            game.battle.enemyAttack();
        }
    }

    render() {
        let vwx = 40 + (this.xpos / 5)
        let vwy = 5 + (this.ypos / 5)

        this.bulletDiv.style.left = vwx.toString() + "vw";
        this.bulletDiv.style.top = vwy.toString() + "vw";
        this.bulletDiv.style.rotate = this.rotation.toString() + "deg";
    }

    deleteRender() {
        this.bulletDiv.remove();
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
        this.dex = 10; // Dexterity - speed
        this.int = 0; // Intelligence (merged with TTRPG Wisdom)
        this.cha = 0; // Charm (TTRPG Charisma)
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
        this.name = "Undefined";
        this.str = 2;
        this.arm = 1;
        this.maxHP = 20;
        this.HP = 20;
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

class Enemy extends Entity {
    constructor(type) {
        super();
        this.type = type;

        if (this.type == "Slime") {
            this.attackTime = 5000;
        } else {
            this.attackTime = 5000;
        }
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
            render();
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
            game.battle.playerAttack(); // TODO: create item usage menu
        }
    }
}

function resetKeysDown() {
    for (let x = 0; x < 4; x++) {
        keysDown[x] = false;
    }
}

let game = new Game();

let keysDown = [false, false, false, false];

generateNewTable(25);
render();

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

game.startBattle("Slime");
