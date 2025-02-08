class Flight {
    constructor(mode) {
        if (mode == "exit") {
            this.exit = true;
        } else {
            this.exit = false;
        }
        this.playerX = 45;
        this.playerY = 0; // 1200 = max
        this.playerImmunityFrames = 0;
        this.playerVelX = 0;
        this.projectiles = [];
    }

    start() {
        this.distributeProjectiles();
        this.updatePlayerPosition();
        this.updateProgressBar();
        this.updateHUD();
        resetKeysDown();
        this.flightFrame();
    }

    distributeProjectiles() {
        if (this.exit) { // Harder version for the escape
            for (let i = 10; i < 120; i++) {
                this.projectiles.push(new flyProjectile(Math.random() * 90, i * 10));
                this.projectiles.push(new flyProjectile(Math.random() * 90, i * 10));
            }
        } else { // Easier version for the entrance
            for (let i = 10; i < 60; i++) {
                this.projectiles.push(new flyProjectile(Math.random() * 90, i * 10));
            }
            for (let i = 60; i < 120; i++) {
                this.projectiles.push(new flyProjectile(Math.random() * 90, i * 10));
                this.projectiles.push(new flyProjectile(Math.random() * 90, i * 10));
            }
        }

    }

    updatePlayerPosition() {
        let vwx = this.playerX * 0.333 + 33;
        document.getElementById("fly-player").style.left = vwx.toString() + "vw";
    }

    updateProgressBar() {
        let barY = (this.playerY * -0.022) + 61;
        document.getElementById("fly-progress-player").style.top = barY.toString() + "vh";
    }

    updateHUD() {
        document.getElementById("fly-status-HP").innerHTML = game.player.HP + "/" + game.player.maxHP + " HP";
        document.getElementById("fly-status-name").innerHTML = game.player.name;
    }

    flightFrame() {
        // Decrease immunity frames if relevant
        if (game.flight.playerImmunityFrames > 0) {
            game.flight.playerImmunityFrames--;
        }

        // Much like the battle runDefendFrame, due to using the setTimeout() function, I am unable to use the "this" keyword, hence the convoluted self-referencing
        for (let p = 0; p < game.flight.projectiles.length; p++) {
            game.flight.projectiles[p].simulate();
        }
        game.flight.deleteUsedProjectiles();


        if (game.flight.playerY < 1200) {
            if (keysDown[2]) {
                game.flight.playerVelX--;
            } else if (keysDown[3]) {
                game.flight.playerVelX++;
            }
            game.flight.playerX += game.flight.playerVelX;
            game.flight.playerVelX *= 0.75;
            if (game.flight.playerX < 0) {
                game.flight.playerX = 0;
                game.flight.playerVelX = 0;
            } else if (game.flight.playerX > 90) {
                game.flight.playerX = 90;
                game.flight.playerVelX = 0;
            }

            game.flight.updateProgressBar();

            game.flight.updatePlayerPosition();
            // Schedule next frame
            game.flight.playerY+=1;
            setTimeout(game.flight.flightFrame, 25);
        } else {
            if (!this.exit) {
                game.setMode("overworld");
            }
        }
    }

    deleteUsedProjectiles() {
        for (let p = this.projectiles.length - 1; p > -1; p--) {
            if (game.flight.projectiles[p].shouldDelete) {
                game.flight.projectiles[p].deleteRender();
                game.flight.projectiles.splice(p, 1);
            }
        }
    }
}

class flyProjectile {
	constructor(x, y) {
		this.xpos = x;
		this.ypos = y;
        this.shouldDelete = false;

        this.projDiv = document.createElement("div");
        this.projDiv.innerHTML = "<b>#</b>";
        this.projDiv.className = "battle-bullet";
        this.projDiv.style.width = "3vw";
        this.projDiv.style.height = "3vw";
        this.projDiv.style.fontSize = "2vw";
        this.projDiv.style.rotate = Math.random() * 360 + "deg";
        document.getElementById("fly-box").appendChild(this.projDiv);

        this.render();
	}

    simulate() {
        if (this.ypos + 20 < game.flight.playerY) {
            this.shouldDelete = true;
        } else if (this.ypos - 100 < game.flight.playerY) {

            let distance = Math.sqrt((game.flight.playerX - this.xpos)**2 + (game.flight.playerY - this.ypos)**2);
            if (distance < 5) { // check to see if it is within range of the player
                if (game.flight.playerImmunityFrames == 0) {
                    game.flight.playerImmunityFrames = 20;
                    game.player.HP -= 2;
                    if (game.player.HP <= 0) {
                        game.robotDied();
                        game.flight.playerImmunityFrames = 200;
                    }
                    game.flight.updateHUD();
                }
                this.shouldDelete = true;
            }
            // otherwise check to see it is not within range of a projectile

            this.render();
        }
    }

    render() {
        let vwx = this.xpos * 0.333 + 33.5;
        let vwy = 81 + (game.flight.playerY - this.ypos);

        this.projDiv.style.left = vwx.toString() + "vw";
        this.projDiv.style.top = vwy.toString() + "vh";

    }

    deleteRender() {
        this.projDiv.remove();
    }
}