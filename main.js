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
        this.save = "arm"; // default to armour save for attacks
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
        switch (this.save) {
            case "str":
                damage -= game.player.rollStr();
            case "dex":
                damage -= game.player.rollDex();
            case "int":
                damage -= game.player.rollInt();
            case "cha":
                damage -= game.player.rollCha();
            default:
                damage -= game.player.rollArm();
        }

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

        // temporary battle pattern picker
        this.enemyBulletPattern();
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

    enemyBulletPattern() {
        switch (this.enemy.type) {
            case "Calculator":
                // Attack - rain down calculator symbols
                this.battleFrames = 400;
                this.save = "int";
                for (let i = 0; i < 28; i++) { // Create 28 bullets
                    let randomX = 10 + Math.random() * 80 // pick a random horizontal position
                    let randomNumSymbol = "0123456789+-×÷=()%"[Math.floor(Math.random() * 18)]
                    let randomRot = (Math.random() * 6) - 3
                    this.bullets.push(new Bullet(randomX, -100, 0, 4, 0, randomRot, "standard", randomNumSymbol, i * 20, 400));

                }

                break;
            case "GameBox":
                let myOption = Math.floor(Math.random() * 2) // Pick 1 or 2
                switch (myOption) {
                    case 0:
                        // Attack 1 - "Flappy Bird"; vertical lines with gaps in them
                        this.battleFrames = 300;
                        this.save = "dex";
                        let alt = 5; // altitude of gap
                        for (let i = 0; i < 12; i++) {
                            for (let tile = 0; tile < 10; tile++) {
                                if (tile != alt) {
                                    this.bullets.push(new Bullet(300, tile * 10 - 4, -5, 0, 0, 0, "standard", "#", i * 20, 400));
                                }
                            }
                            if (alt == 0) {
                                alt = 1;
                            } else if (alt == 9) {
                                alt = 8;
                            } else {
                                let myDirection = Math.floor(Math.random() * 2)
                                if (myDirection == 0) {
                                    alt ++;
                                } else {
                                    alt --;
                                }
                            }
                        }
                        break; // End of GameBox "Flappy Bird" switch
                    case 1:
                        this.save = "arm";
                        this.battleFrames = 300;
                        // Attack 2 - Tetrominoes
                        for (let i = 0; i < 12; i++) {
                            let tetrominoNumber = Math.floor(Math.random() * 5)
                        /* the following bit of code is going to be a bit interesting.
                         * Here's the notation I have used for each piece:
                         *
                         * ##  #  #       #
                         * ##  #  #    ## ##
                         *     #  ##  ##  #
                         *     #
                         *
                         * O   I  L   S   T
                        */
                            let x = null; // random offset used for all of the tetrominoes
                            switch (tetrominoNumber) { // TODO: Fix switch statement back to random
                                case 0: // O - no rotations so this is the simplest
                                    x = Math.random() * 80;
                                    for (let a = 0; a < 2; a++) {
                                        for (let b = 0; b < 2; b++) {
                                            this.bullets.push(new Bullet(x + a * 10, -100 + b * 10, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                        }
                                    }

                                    break;
                                case 1: // I - two rotations - pretty simple
                                    let rotation = Math.floor(Math.random() * 2);
                                    if (rotation == 0) { // Horizontal
                                        x = Math.random() * 60;
                                        for (let a = 0; a < 4; a++) {
                                            this.bullets.push(new Bullet(x + a * 10, -100, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                        }
                                    } else { // Vertical
                                        let x = Math.random() * 90;
                                        for (let a = 0; a < 4; a++) {
                                            this.bullets.push(new Bullet(x, -100 + a * 10, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                        }
                                    }
                                    break;
                                case 2: {// L - two mirror images and 8 rotations between them. oh no
                                    /* There are two mirror images, and 8 rotations between them.
                                     * They can be notated as being either a 3-square long horizontal or vertical bar within a 3x3 grid, with one of four corners being occupied.
                                     * I have used this approach here as it results in the most reusable code. */
                                    x = Math.random() * 70;
                                    let barRotation = Math.floor(Math.random() * 2);
                                    let corner = Math.floor(Math.random() * 4);
                                    //let corner = 0

                                    // Bar
                                    if (barRotation == 0) { // Vertical
                                        for (let a = 0; a < 3; a++) {
                                            this.bullets.push(new Bullet(x, -110 + a * 10, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                        }

                                    } else { // Horizontal
                                        for (let a = 0; a < 3; a++) {
                                            this.bullets.push(new Bullet(x - 10 + a * 10, -100, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                        }
                                    }
                                    // Corner
                                    switch (corner) { // Put a bullet in a corner depending on the number. this entire switch statement could be one line, but it really doesn't look nice'
                                            case 0:
                                                this.bullets.push(new Bullet(x - 10, -110, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                                break;
                                            case 1:
                                                this.bullets.push(new Bullet(x + 10, -110, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                                break
                                            case 2:
                                                this.bullets.push(new Bullet(x - 10, -90, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                                break
                                            case 3:
                                                this.bullets.push(new Bullet(x + 10, -90, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                                break
                                        }

                                    break;}
                                case 3: // S - Very similar to L
                                    x = Math.random() * 70; // random x offset
                                    let barRotation = Math.floor(Math.random() * 2); // whether the bar is vertical or horizontal
                                    let cornerPair = Math.floor(Math.random() * 2); // which of the diagonal corner pairs are used to form the S
                                    // Bar
                                    if (barRotation == 0) { // Vertical
                                        // Make bar
                                        for (let a = 0; a < 2; a++) {
                                            this.bullets.push(new Bullet(x, -110 + a * 10, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                        }
                                        // Add corners
                                        if (cornerPair == 0) {
                                            this.bullets.push(new Bullet(x + 10, -110, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                            this.bullets.push(new Bullet(x - 10, -100, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                        } else { // Horizontal
                                            this.bullets.push(new Bullet(x + 10, -100, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                            this.bullets.push(new Bullet(x - 10, -110, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                        }

                                    } else { // Horizontal
                                        // Make bar
                                        for (let a = 0; a < 2; a++) {
                                            this.bullets.push(new Bullet(x - 10 + a * 10, -100, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                        }
                                        // Add corners
                                        if (cornerPair == 0) {
                                            this.bullets.push(new Bullet(x - 10, -110, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                            this.bullets.push(new Bullet(x, -90, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                        } else {
                                            this.bullets.push(new Bullet(x - 10, -90, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                            this.bullets.push(new Bullet(x, -110, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                        }
                                    }
                                    break;
                                case 4: // T
                                    x = Math.random() * 70;
                                    let corner = Math.floor(Math.random() * 4); // Pick a random corner to not do
                                    // Make center
                                    this.bullets.push(new Bullet(x, -100, 0, 5,  0, 0, "standard", "#", i * 30, 400));

                                    // Do each corner except the one picked to not do
                                    if (corner != 0) { // Up
                                        this.bullets.push(new Bullet(x, -110, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                    }
                                    if (corner != 1) { // Down
                                        this.bullets.push(new Bullet(x, -90, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                    }
                                    if (corner != 2) { // Left
                                        this.bullets.push(new Bullet(x - 10, -100, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                    }
                                    if (corner != 3) { // Right
                                        this.bullets.push(new Bullet(x + 10, -100, 0, 5,  0, 0, "standard", "#", i * 30, 400));
                                    }
                                    break;
                            }
                        }
                        break; // End of Gamebox Tetromino option switch
                }
                break; // End of GameBox option switch
            case "Optical Disk":
                // Attack - roll wheels
                console.log("hello");
                this.battleFrames = 300;
                for (let x = 0; x < 10; x++) {
                    let r = 10 + Math.random() * 80 // pick a random height
                    let spd = 2 + Math.random() * 3 // pick a random speed
                    for (let y = 0; y < 6; y++) { // create six projectiles revolving around one point
                        this.bullets.push(new Bullet(-250, r, spd, 0,  y * 60, spd, "revolving", "#", x * 30, 400));
                    }
                }
                break;
            default:


                break;
        }
    }
}

class Bullet {
    constructor(xp, yp, xv, yv, rt, rv, type, sym, wf, lf) {
        // Self-explanatory; position, velocity
        this.xpos = xp;
        this.ypos = yp;
        this.xvel = xv;
        this.yvel = yv;
        this.rotation = rt;
        this.rotvel = rv;

        this.type = type; // Which behaviour it follows. See below
        this.symbol = sym; // Which symbol it renders as
        this.shouldDelete = false; // When it's set to true, the Battle object will delete it.'

        this.waitFrames = wf; // Wait frames: how many frames it should wait before activating
        this.lifeFrames = lf; // Life frames: how many frames before it should delete automatically

        // Bullet types
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
        // Handle wait frames and life frames
        if (this.waitFrames > 0) {
            this.waitFrames--;
            return;
        }
        if (this.lifeFrames > 0) {
            this.lifeFrames --;
        } else {
            this.shouldDelete = true;
            return;
        }

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
        this.str = 5;
        this.arm = 5;
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
        switch (this.type) {
            case "Calculator":
                this.maxHP = 8;
                this.str = 1;
                this.arm = 1;
                break;
            case "Floppy Disk":
                this.maxHP = 5;
                this.str = 1;
                this.arm = 1;
                break;
            case "GameBox":
                this.maxHP = 20;
                this.str = 4;
                this.arm = 1;
                break;
            case "Optical Disk": {
                this.maxHP = 30;
                this.str = 3;
                this.arm = 1;
            }
        }
        this.HP = this.maxHP; // set their HP to full
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

game.startBattle("Calculator");
