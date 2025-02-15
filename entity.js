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
        for (let poiN = 0; poiN < game.overworld.pois.length; poiN++) {
            console.log("hello");
            if (game.overworld.pois[poiN].xpos == this.xpos && game.overworld.pois[poiN].ypos == this.ypos) {
                game.overworld.pois[poiN].use();
            }
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
        this.credits = 5000000;
    }
}

class Enemy extends Entity {
    constructor(type) {
        super();
        this.type = type;
        this.flavourText = ["Flavour text placeholder"];
        this.flavourTextLow = "Low HP placeholder";
        switch (this.type) {
            case "Calculator":
                this.maxHP = 8;
                this.str = 1;
                this.arm = 0;
                this.flavourText = ["The Calculator is full of add-ticipation.", "Calculator is positive it is going to win."]
                this.flavourTextLow = "The Calculator's screen is cracked.";
                break;
            case "Floppy Disk":
                this.maxHP = 5;
                this.str = 1;
                this.arm = 0;
                this.flavourText = ["It seems you are fighting a floppy disk.", "Up to a megabyte of storage!", "Floppy disk's expression is unreadable."]
                this.flavourTextLow = "Floppy disk has nearly reached capacity.";
                break;
            case "GameBox":
                this.maxHP = 15;
                this.str = 4;
                this.arm = 0;
                this.flavourText = ["Power plug sold separately!", "Controller sold separately!", "Graphics card sold separately!"];
                this.flavourTextLow = "GameBox is coming to an afterlife near you.";
                break;
            case "Optical Disk":
                this.maxHP = 16;
                this.str = 3;
                this.arm = 0;
                this.flavourText = ["The Optical disk dazzles you with its iridescent shine.", "The Optical Disk attempts to insert itself in a slot, upside down."];
                this.flavourTextLow = "The Optical disk is badly scratched.";
                break;
            case "Keyboard":
                this.maxHP = 13;
                this.str = 4;
                this.arm = 2;
                this.flavourText = ["Keyboard is spreading misinformation online.", "Keyboard takes control of the situation."];
                this.flavourTextLow = "The keyboard is missig a few keys"; // Intentional typo here - it is allegedly funny
                break;
        }
        this.HP = this.maxHP; // set their HP to full
    }
}