 
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
		this.playerWasHit = false; // Used for the "perfection" dream
		this.playerThrill = false; // Used for the "daredevil" dream
    }

    start() {
        this.updateHPDisplays();
        this.updateNameDisplays();
        this.playerTurnStart();
		this.playerWasHit = false;
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
        document.getElementById("battle-enemy").style.display="block";
    }

    playerTurnStart() {
        // clear bullets
            // remove each bullet div
        for (let bulletNumber = 0; bulletNumber < game.battle.bullets.length; bulletNumber++) {
                game.battle.bullets[bulletNumber].deleteRender();
            }
        this.bullets = []; // clear array

        // Set flavour text
        if (this.enemy.HP < this.enemy.maxHP * 0.25) {
            document.getElementById("battle-log").innerHTML = this.enemy.flavourTextLow;
        } else {
            let flavourText = this.enemy.flavourText[Math.floor(Math.random() * this.enemy.flavourText.length)]
            document.getElementById("battle-log").innerHTML = flavourText;
        }
		
		// Check conditions for Thrill dream
		if (this.playerThrill) {
			game.robotDreamFulfilled();
			game.addToLog(game.player.name + " fulfilled their lifelong dream of true thrill.");
			document.getElementById("battle-log").innerHTML = game.player.name + " fulfilled their lifelong dream of true thrill.";
			this.updateHPDisplays();
			this.playerThrill = false;
		}

        // hide monster attack stuff
        document.getElementById("battle-board").style.display="none";
        document.getElementById("battle-soul").style.display="none";
        // display action buttons
        document.getElementById("battle-actions").style.display="block";
        document.getElementById("battle-player").style.display="block"

        this.hideBattleInventory(); // Show action buttons
    }

    playerAttack() {
        game.battle.hideBattleInventory();
        let damage = game.player.rollStr();
        damage -= this.enemy.rollArm();
        if (damage < 1) {
            damage = 1;
        }


        // hide action buttons
        document.getElementById("battle-actions").style.display="none";


        this.enemy.HP -= damage;
        this.updateHPDisplays();

        if (this.enemy.HP > 0) {
            setTimeout(this.enemyTurnStart, 1500);
            setTimeout(this.playerAttackAnimationFrame, 50, 0, true);
        } else {
            setTimeout(this.playerAttackAnimationFrame, 50, 0, false);
            this.enemyDefeatedFrame(0)
            setTimeout(this.end, 2000);
        }

    }
    playerUseItem(number) {
        if (number >= game.player.inventory.length) { // ensure we aren't dealing with a nonexistent item
            return;
        }

        // hide action buttons
        document.getElementById("battle-actions").style.display="none";

        if (game.player.inventory[number].consumable) {
            if (game.player.favFood == game.player.inventory[number].type) {
                game.player.HP += Math.floor(game.player.inventory[number].consumeHP * 1.5);
                document.getElementById("battle-log").innerHTML = "You ate " + game.player.inventory[number].displayName + ", your favourite food. Delicious.";
            } else {
                game.player.HP += game.player.inventory[number].consumeHP;
                document.getElementById("battle-log").innerHTML = game.player.inventory[number].useText;
            }
            if (game.player.HP > game.player.maxHP) {
                game.player.HP = game.player.maxHP;
            } else if (game.player.HP < 1) {; // This is to prevent the player from ending up with negative health due to eating soap.
				game.player.HP = 1;
			}
        }
		
		// Fulfill the dream of hygiene if the player eats soap;
		if (game.player.inventory[number].type == "soap") {
			game.robotDreamFulfilled();
			game.addToLog(game.player.name + " fulfilled their lifelong dream of hygiene.");
		}

        // Decrease the number of items
        if (game.player.inventory[number].count < 2) {
            game.player.inventory.splice(number, 1);
        } else {
            game.player.inventory[number].count --;
        }

        game.battle.hideBattleInventory();
		this.updateHPDisplays();

        setTimeout(this.enemyTurnStart, 850);
        setTimeout(game.battle.playerShrinkAnimationFrame, 350, 0);
    }

    enemyAttack() {
        if (this.playerImmunityFrames > 0) {
            return;
        }
        let damage = this.enemy.rollStr();
        switch (this.save) {
            case "str":
                damage -= game.player.rollStr();
                break;
            case "dex":
                damage -= game.player.rollDex();
                break;
            case "int":
                damage -= game.player.rollInt();
                break;
            case "cha":
                damage -= game.player.rollCha();
                break;
            default:
                damage -= game.player.rollArm();
        }

        if (damage < 1) {
            damage = 1;
        }
        game.player.HP -= damage;
		this.updateHPDisplays();
		this.playerWasHit = true;

        if (game.player.HP > 0) {
            this.playerImmunityFrames = 20;
        } else {
            this.battleFrames = 0;
            game.robotDied();
            this.updateNameDisplays();
            this.updateHPDisplays();
			this.playerThrill = false; // Thrill dream - death resets it
        }

    }

    enemyTurnStart() {
        resetKeysDown();
        // show monster attack stuff and hide player
        document.getElementById("battle-player").style.display="none";
        document.getElementById("battle-board").style.display="block";
        document.getElementById("battle-soul").style.display="block";

        game.battle.playerPosX = 45;
        game.battle.playerPosY = 45;
        game.battle.playerVelX = 0;
        game.battle.playerVelY = 0;

        game.battle.battleFrames = 0;

        game.battle.updatePlayerPos();
		
		// Set the flag if the player's dream is Thrill and they are at less than 20% HP
		if (game.player.dream == "daredevil" && game.player.HP <= game.player.maxHP * 0.2) {
			game.battle.playerThrill = true;
		}

        game.battle.timeout = setTimeout(game.battle.runDefendFrame, 50);

        game.battle.enemyBulletPattern();
    }

    playerAttackAnimationFrame(frame, followByShrink) {
        let xpos = (30 + (Math.sin((frame * 3.14) / 10)) * 25);
        document.getElementById("battle-player").style.left = xpos.toString() + "vw";
        if (frame < 10) {
            setTimeout(game.battle.playerAttackAnimationFrame, 50, frame + 1, followByShrink);
        } else {
            if (followByShrink) {
                setTimeout(game.battle.playerShrinkAnimationFrame, 350, 0);
            }
        }
    }

    playerShrinkAnimationFrame(frame) {
        // 10 FRAMES
        let xpos = (30 + (frame * 19) / 10);
        document.getElementById("battle-player").style.left = xpos.toString() + "vw";
        let ypos = (10 + (frame * 4) / 10);
        document.getElementById("battle-player").style.top = ypos.toString() + "vw";
        let size = (10 - (frame * 8) / 10);
        document.getElementById("battle-player").style.width = size.toString() + "vw";
        document.getElementById("battle-player").style.height = size.toString() + "vw";
        let fontSize = (6 - (frame * 4.5) / 10);
        document.getElementById("battle-player").style.fontSize = fontSize.toString() + "vw";

        if (frame < 10) {
            setTimeout(game.battle.playerShrinkAnimationFrame, 50, frame + 1);
        } else {
            // reset player div appearance and hide it
            document.getElementById("battle-player").style.display="none";
            document.getElementById("battle-player").style.width = "10vw";
            document.getElementById("battle-player").style.height = "10vw";
            document.getElementById("battle-player").style.fontSize = "6vw";
            document.getElementById("battle-player").style.left = "30vw";
            document.getElementById("battle-player").style.top = "10vw";
        }
    }

    playerGrowAnimationFrame(frame) {
        // 10 FRAMES
        let reverseFrame = 10 - frame;
       //let vwx = 10 + (game.battle.playerPosY / 5);
        let vwy = -5 + (game.battle.playerPosY / 5);
        //let xpos = (30 + (reverseFrame * (game.battle.playerPosY / 5)) / 10); // Original - optimised down to the following:
        //let ypos = (10 + (reverseFrame * -5 + (game.battle.playerPosY / 5)) / 10); // Also optimised down
        let xpos = 30 + reverseFrame * (1 + (game.battle.playerPosX / 50));
        document.getElementById("battle-player").style.left = xpos.toString() + "vw";
        let ypos = 10 + reverseFrame * (-0.5 + (game.battle.playerPosY / 50));
        document.getElementById("battle-player").style.top = ypos.toString() + "vw";
        let size = (10 - (reverseFrame * 8) / 10);
        document.getElementById("battle-player").style.width = size.toString() + "vw";
        document.getElementById("battle-player").style.height = size.toString() + "vw";
        let fontSize = (6 - (reverseFrame * 4.5) / 10);
        document.getElementById("battle-player").style.fontSize = fontSize.toString() + "vw";

        if (frame < 10) {
            setTimeout(game.battle.playerGrowAnimationFrame, 50, frame + 1);
        } else {
            // reset player div appearance and hide it
            document.getElementById("battle-player").style.width = "10vw";
            document.getElementById("battle-player").style.height = "10vw";
            document.getElementById("battle-player").style.fontSize = "6vw";
            document.getElementById("battle-player").style.left = "30vw";
            document.getElementById("battle-player").style.top = "10vw";
        }
    }

    enemyDefeatedFrame(frame) {
        // 10 FRAMES
        let x = 60 + (frame * 4);
        let y = 10 - frame;
        let rot = frame * 72;
        document.getElementById("battle-enemy").style.left = x.toString() + "vw";
        document.getElementById("battle-enemy").style.top = y.toString() + "vw";
        document.getElementById("battle-enemy").style.rotate = rot.toString() + "deg";

        if (frame < 10) {
            setTimeout(game.battle.enemyDefeatedFrame, 50, frame + 1);
        } else {
            // reset player div appearance and hide it
            document.getElementById("battle-enemy").style.display="none";
            document.getElementById("battle-enemy").style.width = "10vw";
            document.getElementById("battle-enemy").style.height = "10vw";
            document.getElementById("battle-enemy").style.fontSize = "6vw";
            document.getElementById("battle-enemy").style.left = "60vw";
            document.getElementById("battle-enemy").style.top = "10vw";
        }
    }

    runDefendFrame() {
        // NOTE: because of JS's quirks, the "this" keyword does not work, hence the constant convoluted self-referencing.
        if (game.battle.battleFrames > 1) {
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
            game.battle.playerGrowAnimationFrame(0);
            game.battle.playerTurnStart();

        }
    }

    end() { // More convoluted self-reference due to timeout usage
		if (game.player.dream == "perfection" && !game.battle.playerWasHit) {
			game.robotDreamFulfilled();
			game.addToLog(game.player.name + " fulfilled their lifelong dream of perfection.");
		} else if (game.player.dream == "revenge") {
			if (game.player.dreamProgress < 4) {
				game.player.dreamProgress++;
			} else {
				game.robotDreamFulfilled();
				game.addToLog(game.player.name + " fulfilled their lifelong dream of revenge.");
			}
		}
        let selectedVerb = ["obliterated", "destroyed", "vanquished", "discombobulated", "exterminated",
        "eviscerated", "laid waste to", "annihilated", "demolished"][Math.floor(Math.random() * 8)];
        game.addToLog("A " + game.battle.enemy.type + " was " + selectedVerb + " by " + game.player.name +
            ". It dropped " + game.battle.enemy.reward + " credits.");
        game.player.credits += game.battle.enemy.reward;
		game.robotWealthDreamCheck();
        game.setMode("overworld");
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
                for (let i = 0; i < 56; i++) { // Create 28 bullets
                    let randomX = -10 + Math.random() * 110 // pick a random horizontal position
                    let randomNumSymbol = "0123456789+-×÷=()%"[Math.floor(Math.random() * 18)]
                    let randomRot = (Math.random() * 6) - 3
                    this.bullets.push(new Bullet(randomX, -100, 0, 4, 0, randomRot, "standard", randomNumSymbol, i * 10, 400));
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
                            switch (tetrominoNumber) {
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
                this.battleFrames = 200;
                for (let x = 0; x < 6; x++) {
                    let r = 10 + Math.random() * 80 // pick a random height
                    let spd = 2 + Math.random() * 3 // pick a random speed
                    for (let y = 0; y < 6; y++) { // create six projectiles revolving around one point
                        this.bullets.push(new Bullet(-250, r, spd, 0,  y * 60, spd, "revolving", "#", x * 30, 400));
                    }
                }
                break;
			case "Keyboard":
				this.battleFrames = 300;
				let randomPhrase = [
					"don'tythrowcstoneshwhenqyouxhavezbrittleibonesgsiogjigpfsgs3",
					"baskhinsthejresplendentqglorynofsthehsun'sqlife-givingbrays?",
					"mayqthebweatherxbezpleasantkandfyourshousebnotzonhfire5tijgh",
					"what'suwithtthe5airlinevfoodhthesezdays?xit'shreallygnothon.",
					"turns6out9yourhmanvwithzawplantwasujustvaxmannequin[pgfdjgdf",
                    "thevthing1about5life[you'vedgoteto2remembercisvthatxithstops",
                    "youvaretprotectedainpasway6you2willb5neverjrealise47dfbpodas",
                    "forawhatnit'sbworth,bforywhatpitzisn'tbworthfojfhdgfdhdfhnhf",
                    "grifjhkfsipo65hhfdmgrsfgfngrpdmgfdnmct4hnrsbofsdni9t4bgnrsou",
                    "there'scnothingblessucomfortable3thanmseverexpainf23r4t49gfn"
				][Math.floor(Math.random() * 5)]
				for (let i = 0; i < 60; i++) {
					let x = -10 + Math.random() * 120; // pick a random x position
					let spd = -8 + Math.random() * 3;
					this.bullets.push(new Bullet(x, 300, 0, spd, 0, 0, "standard", randomPhrase[i], i * 4, 150));
				}
				break;
            case "Telescope":
                this.battleFrames = 200;
                for (let i = 0; i < 30; i++) {
                    let x = -75 + Math.random() * 150; // pick a random x position
                    this.bullets.push(new Bullet(x, -100, 1, 4, 0, 0, "standard", "#", i * 6, 150));
                }
				break;
            case "Printer":
                this.battleFrames = 300;
				let character = "";
				let gap = 0;
				for (let l = 0; l < 7; l++) { // l = line
					gap = Math.floor(Math.random() * 10);
					for (let r = 0; r < 10; r++) {
						if (r != gap) { // Don't place the character if it is the gap
							character = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
							this.bullets.push(new Bullet(r * 10 - 6, -100, 0, 2, 0, 0, "standard", character, l * 40, 200));
						}
					}
				}
				break;
			case "VHS Player": // Six attacks, more difficult versions of the other monsters.
				let choice = Math.floor(Math.random() * 6); // Pick which of the 6 attacks it will do
				switch (choice) {
					case 0: // Attack 0 - calculator symbols but at higher frequency
						this.battleFrames = 400;
						this.save = "int";
						for (let i = 0; i < 112; i++) { // Create 28 bullets
							let randomX = -10 + Math.random() * 110 // pick a random horizontal position
							let randomNumSymbol = "0123456789+-×÷=()%"[Math.floor(Math.random() * 18)]
							let randomRot = (Math.random() * 6) - 3
							this.bullets.push(new Bullet(randomX, -100, 0, 4, 0, randomRot, "standard", randomNumSymbol, i * 5, 400));
						}
						break;
					case 1: // Attack 1 - alternating between GameBox tetrominoes and Flappy Bird "sweepers"
						this.battleFrames = 300;
						let tDelay = null;
						for (let w = 0; w < 2; w++) { // Loop for each pair of tetrominoes and flappy bird lines
							for (let i = 0; i < 5; i++) {
								tDelay = i * 15;
								let tetrominoNumber = Math.floor(Math.random() * 5)
								let x = null; // random offset used for all of the tetrominoes
								switch (tetrominoNumber) {
									case 0: // O - no rotations so this is the simplest
										x = Math.random() * 80;
										for (let a = 0; a < 2; a++) {
											for (let b = 0; b < 2; b++) {
												this.bullets.push(new Bullet(x + a * 10, -100 + b * 10, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
											}
										}
                                    break;
									case 1: // I - two rotations - pretty simple
										let rotation = Math.floor(Math.random() * 2);
										if (rotation == 0) { // Horizontal
											x = Math.random() * 60;
											for (let a = 0; a < 4; a++) {
												this.bullets.push(new Bullet(x + a * 10, -100, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
											}
										} else { // Vertical
											let x = Math.random() * 90;
											for (let a = 0; a < 4; a++) {
												this.bullets.push(new Bullet(x, -100 + a * 10, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
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
												this.bullets.push(new Bullet(x, -110 + a * 10, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
											}

										} else { // Horizontal
											for (let a = 0; a < 3; a++) {
												this.bullets.push(new Bullet(x - 10 + a * 10, -100, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
											}
										}
										// Corner
										switch (corner) { // Put a bullet in a corner depending on the number. this entire switch statement could be one line, but it really doesn't look nice'
                                            case 0:
                                                this.bullets.push(new Bullet(x - 10, -110, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
                                                break;
                                            case 1:
                                                this.bullets.push(new Bullet(x + 10, -110, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
                                                break
                                            case 2:
                                                this.bullets.push(new Bullet(x - 10, -90, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
                                                break
                                            case 3:
                                                this.bullets.push(new Bullet(x + 10, -90, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
                                                break
                                        }

										break;
									}
									case 3: // S - Very similar to L
										x = Math.random() * 70; // random x offset
										let barRotation = Math.floor(Math.random() * 2); // whether the bar is vertical or horizontal
										let cornerPair = Math.floor(Math.random() * 2); // which of the diagonal corner pairs are used to form the S
										// Bar
										if (barRotation == 0) { // Vertical
											// Make bar
											for (let a = 0; a < 2; a++) {
												this.bullets.push(new Bullet(x, -110 + a * 10, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
											}
											// Add corners
											if (cornerPair == 0) {
												this.bullets.push(new Bullet(x + 10, -110, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
												this.bullets.push(new Bullet(x - 10, -100, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
											} else { // Horizontal
												this.bullets.push(new Bullet(x + 10, -100, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
												this.bullets.push(new Bullet(x - 10, -110, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
											}

										} else { // Horizontal
											// Make bar
											for (let a = 0; a < 2; a++) {
												this.bullets.push(new Bullet(x - 10 + a * 10, -100, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
											}
											// Add corners
											if (cornerPair == 0) {
												this.bullets.push(new Bullet(x - 10, -110, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
												this.bullets.push(new Bullet(x, -90, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
											} else {
												this.bullets.push(new Bullet(x - 10, -90, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
												this.bullets.push(new Bullet(x, -110, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
											}
										}
										break;
									case 4: // T
										x = Math.random() * 70;
										let corner = Math.floor(Math.random() * 4); // Pick a random corner to not do
										// Make center
										this.bullets.push(new Bullet(x, -100, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));

										// Do each corner except the one picked to not do
										if (corner != 0) { // Up
											this.bullets.push(new Bullet(x, -110, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
										}
										if (corner != 1) { // Down
											this.bullets.push(new Bullet(x, -90, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
										}
										if (corner != 2) { // Left
											this.bullets.push(new Bullet(x - 10, -100, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
										}
										if (corner != 3) { // Right
											this.bullets.push(new Bullet(x + 10, -100, 0, 5,  0, 0, "standard", "#", tDelay + 150 * w, 400));
										}
										break;
								}
							}
							
							// Flappy bird bars
							let gap = 2 + Math.floor(Math.random() * 6);
                            for (let tile = 0; tile < 10; tile++) {
                                if (tile != gap) {
                                    this.bullets.push(new Bullet(300, tile * 10 - 4, -5, 0, 0, 0, "standard", "#", 150 * w + 60, 400));
                                }
                            }
							gap = 2 + Math.floor(Math.random() * 6);
							for (let tile = 0; tile < 10; tile++) {
                                if (tile != gap) {
                                    this.bullets.push(new Bullet(-300, tile * 10 + 4, 5, 0, 0, 0, "standard", "#", 150 * w + 90, 400));
                                }
                            }
                        }
						break;
					case 2: // Attack 2 - Optical disk rolling, but from both left and right
						this.battleFrames = 400;
						for (let x = 0; x < 12; x++) {
							let r = 10 + Math.random() * 80 // pick a random height
							let spd = 2 + Math.random() * 4 // pick a random speed
							for (let y = 0; y < 6; y++) { // create six projectiles revolving around one point
								this.bullets.push(new Bullet(-350, r, spd, 0,  y * 60, spd, "small-revolving", "#", x * 30, 400));
							}
						}
						for (let x = 0; x < 12; x++) {
							let r = 10 + Math.random() * 80 // pick a random height
							let spd = 2 + Math.random() * 4 // pick a random speed
							for (let y = 0; y < 6; y++) { // create six projectiles revolving around one point
								this.bullets.push(new Bullet(350, r, 0 - spd, 0, y * 60, 0 - spd, "small-revolving", "#", x * 30, 400));
							}
						}
						break;
					case 3: // Attack 3 - Keyboard text, but from four directions
						this.battleFrames = 250;
						let randomPhrase = ["andwecouldallusealittlechangejhf", "moreafraidofyouthanyouareofitsdf", "yknowlifeislikeaboxofchocolatess",
						"staydeterminedyouarethefutureoft", "universesaidiloveyouasyouarelove", "hellojonapologiesforthedeception",
						"password123password123password12", "54f24524bd3314bfaa3c47e53635d563", "01001100010011110111011001100101",
						"thechemistryisgonetakenforaridea"][Math.floor(Math.random() * 10)];
						
						// From below
						for (let l = 0; l < 16; l++) {
							let x = -10 + Math.random() * 120; // pick a random x position
							let spd = -6 + Math.random() * 3;
							this.bullets.push(new Bullet(x, 300, 0, spd, 0, 0, "standard", randomPhrase[l], l * 5, 150));
						}
						// From left
						for (let l = 0; l < 16; l++) {
							let y = -10 + Math.random() * 120; // pick a random y position
							let spd = 3 + Math.random() * 3;
							this.bullets.push(new Bullet(-300, y, spd, 0, 0, 0, "standard", randomPhrase[l], l * 5, 150));
						}
						// From above
						for (let l = 16; l < 32; l++) {
							let x = -10 + Math.random() * 120; // pick a random x position
							let spd = 3 + Math.random() * 3;
							this.bullets.push(new Bullet(x, -300, 0, spd, 0, 0, "standard", randomPhrase[l], l * 5, 150));
						}
						// From right
						for (let l = 16; l < 32; l++) {
							let y = -10 + Math.random() * 120; // pick a random y position
							let spd = -6 + Math.random() * 3;
							this.bullets.push(new Bullet(300, y, spd, 0, 0, 0, "standard", randomPhrase[l], l * 5, 150));
						}
						break;
					case 4: // Attack 4 - Telescope meteorites but with randomness added to their trajectory and velocity
						this.battleFrames = 250;
						for (let i = 0; i < 120; i++) {
							let x = -75 + Math.random() * 150; // pick a random x position
							this.bullets.push(new Bullet(x, -100, 1 + Math.random(), 4 + Math.random(), 0, 0, "standard", "#", i * 2, 150));
						}
						break;
					case 5: // Attack 5 - Printer bars from varying directions, with a slight bit of deviation
						this.battleFrames = 400;
						for (let l = 0; l < 12; l++) { // l = line
							let gap = 2 + Math.floor(Math.random() * 6);
							let direction = Math.floor(Math.random() * 4);
							switch (direction) {
								case 0:
									for (let r = 0; r < 10; r++) {
										if (r != gap) { // Don't place the character if it is the gap
											let character = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
											this.bullets.push(new Bullet(r * 10 - 6, -100, 0, 3 + Math.random() * 0.25, 0, 0, "standard", character, l * 30, 200));
										}
									}
									break;
								case 1:
									for (let r = 0; r < 10; r++) {
										if (r != gap) { // Don't place the character if it is the gap
											let character = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
											this.bullets.push(new Bullet(r * 10 - 6, 200, 0, -3 - Math.random() * 0.25, 0, 0, "standard", character, l * 30, 200));
										}
									}
									break;
								case 2:
									for (let r = 0; r < 10; r++) {
										if (r != gap) { // Don't place the character if it is the gap
											let character = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
											this.bullets.push(new Bullet(-100, r * 10 - 6, 3 + Math.random() * 0.25, 0, 0, 0, "standard", character, l * 30, 200));
										}
									}
									break;
								case 3:
									for (let r = 0; r < 10; r++) {
										if (r != gap) { // Don't place the character if it is the gap
											let character = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
											this.bullets.push(new Bullet(200, r * 10 - 6, -3 - Math.random() * 0.25, 0, 0, 0, "standard", character, l * 30, 200));
										}
									}
									break;
							}
						}
						break;
				}
				break;
            default:
                console.log("no monster bullet pattern found for " + this.enemy.type);
                break;
        }
    }

    displayBattleInventory() {
        for (let i = 0; i < 8; i++) {
            if (i < game.player.inventory.length) {
                document.getElementById("battle-td-i" + i).innerHTML = game.player.inventory[i].displayName + " x" + game.player.inventory[i].count;
                document.getElementById("battle-td-b" + i).style.display = "inline-block";
            } else {
                document.getElementById("battle-td-i" + i).innerHTML = "";
                document.getElementById("battle-td-b" + i).style.display = "none";
            }

        }
        document.getElementById("battle-inventory").style.display = "block";
        document.getElementById("battle-return-button").style.display = "inline-block";
        document.getElementById("battle-attack-button").style.display = "none";
        document.getElementById("battle-item-button").style.display = "none";

    }

    hideBattleInventory() {
        document.getElementById("battle-inventory").style.display = "none";
        document.getElementById("battle-attack-button").style.display = "inline-block";
        document.getElementById("battle-item-button").style.display = "inline-block";
        document.getElementById("battle-return-button").style.display = "none";
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
            this.size = 25;
        } else if (this.type == "big") {
            this.size = 40;
        } else if (this.type == "revolving") {
            this.size = 25;
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
        this.bulletDiv.style.fontSize = (this.size / 8).toString() + "vw";
		
		// Hide if the bullets aren't active yet
		if (this.waitFrames > 0) {
			this.bulletDiv.style.display = "none";
		}

        // add to document
        document.getElementById("battle-box").appendChild(this.bulletDiv);
        this.render();
    }

    simulate() {
        // Handle wait frames and life frames
        if (this.waitFrames > 0) {
            this.waitFrames--;
			if (this.waitFrames == 0) {
				this.bulletDiv.style.display = "block";
			}
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
