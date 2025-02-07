class Flight {
    constructor() {
        this.playerX = 45;
        this.playerY = 0; // 1200 = max
        this.playerVelX = 0;
    }

    start() {
        this.updatePlayerPosition();
        this.updateProgressBar();
        resetKeysDown();
        this.flightFrame();
    }

    updatePlayerPosition() {
        let vwx = this.playerX * 0.333 + 33;
        document.getElementById("fly-player").style.left = vwx.toString() + "vw";
    }

    updateProgressBar() {
        let barY = (this.playerY * -0.022) + 61;
        console.log(barY);
        document.getElementById("fly-progress-player").style.top = barY.toString() + "vh";
    }

    updateHUD() {

    }

    flightFrame() {
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
            game.flight.playerY++;
            setTimeout(game.flight.flightFrame, 25);
        } else {
            console.log("done"); //todo: get game object to switch to corresponding mode
        }
    }
}

class flyProjectile {
	constructor(x, y) {
		this.xpos = x;
		this.ypos = y;
		this.rot = Math.random() * 360;
	}
}