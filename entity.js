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
        this.maxHP = 12;
        this.HP = 12;
        this.inventory = [ // Starting items - 2 unripe apples and a piece of burnt toast
            new Item("apple", 2),
            new Item("toast", 1)
        ];
        this.dream = "friendship";
		this.dreamProgress = 0; // A number to denote dream progress for dreams that take multiple steps
        this.favFood = "apple";
        this.credits = 1000000;
    }

    useItemOverworld(slot) {
        // Ensure we aren't trying to use a non-existent item
        if (slot >= this.inventory.length ) {
            return false;
        }

        // Perform whichever action is needed for the item
        if (this.inventory[slot].consumable) { // There are no items other than food that can be used in the overworld
            if (this.inventory[slot].type == this.favFood) {
                this.HP += Math.floor(this.inventory[slot].consumeHP * 1.5);
                game.addToLog(this.name + " enjoyed " + this.inventory[slot].displayName +
                    ", their favourite food." + "(+" + Math.floor(this.inventory[slot].consumeHP * 1.5) + " HP)");
            } else {
                this.HP += this.inventory[slot].consumeHP;
                game.addToLog(this.inventory[slot].useText);
            }

            if (this.HP > this.maxHP) {
                this.HP = this.maxHP;
            } else if (this.HP < 1) {
				this.HP = 1; // This is to prevent the player from ending up with negative health due to eating soap.
			}

        } else {
            return false;
        }
		
		// Achieve hygiene dream if the item is soap
		if (this.inventory[slot].type == "soap") {
			game.robotDreamFulfilled();
			game.addToLog(this.name + " fulfilled their lifelong dream of hygiene.");
		}
		
        // Decrease the number of item
        if (this.inventory[slot].count < 2) {
            this.inventory.splice(slot, 1);
        } else {
            this.inventory[slot].count --;
        }

        updateStatDisplay();
        updateInventoryDisplay();
        return true;
    }

    hasSpaceFor(itemType) { // Utility used to see if the player has inventory space for an item
        if (this.inventory.length < 8) {
            return true;
        }
        for (let i = 0; i < 8; i++) {
            if (this.inventory[i].type == itemType) {
                return true;
            }
        }
        return false;
    }

    giveItem(itemType, count) { // This will have no effect if there's no space
        // First, see if the item already exists
        for (let i  = 0; i < this.inventory.length; i++) {
            if (this.inventory[i].type == itemType) {
                this.inventory[i].count += count;
                return;
            }
        }

        // If that fails, see if we can add it in
        if (this.inventory.length < 8) {
            this.inventory.push(new Item(itemType, count));
        }
    }
}

class Enemy extends Entity {
    constructor(type) {
        super();
        this.type = type;
        this.flavourText = ["Flavour text placeholder"];
        this.flavourTextLow = "Low HP placeholder";
        this.reward = 0;
        switch (this.type) {
            case "Calculator":
                this.maxHP = 8;
                this.str = 1;
                this.arm = 0;
                this.reward = 100000;
                this.flavourText = ["The Calculator is full of add-ticipation.",
                    "Calculator is positive it is going to win.",
                    "Calculator ponders what it will do when you are out of the equation.",
                    "The Calculator claims it is only using a fraction of its true power."]
                this.flavourTextLow = "The Calculator's screen is cracked.";
                break;
            case "GameBox":
                this.maxHP = 15;
                this.str = 4;
                this.arm = 0;
                this.reward = 250000;
                this.flavourText = ["Power plug sold separately!", "Controllers sold separately!",
                    "Graphics card sold separately!", "Unlock volume settings with GameBox Plus!",
					"GameBox recommends that you save yourself, and quit."];
                this.flavourTextLow = "GameBox is coming to an afterlife near you.";
                break;
            case "Optical Disk":
                this.maxHP = 16;
                this.str = 3;
                this.arm = 0;
                this.reward = 240000;
                this.flavourText = ["The Optical disk dazzles you with its iridescent shine.",
                    "The Optical Disk attempts to insert itself in a slot, upside down.",
                    "The Optical disk spins rapidly."];
                this.flavourTextLow = "The Optical disk is badly scratched.";
                break;
            case "Keyboard":
                this.maxHP = 9;
                this.str = 4;
                this.arm = 1;
                this.reward = 150000;
                this.flavourText = ["Keyboard is spreading misinformation online.",
                    "Keyboard takes control of the situation.", "The Keyboard's 'W' key is severely worn down."
                ];
                this.flavourTextLow = "The keyboard is missig a few keys"; // Intentional typo here; attempt at humour
                break;
            case "Telescope":
                this.maxHP = 12;
                this.str = 4;
                this.arm = 2;
                this.reward = 250000;
                this.flavourText = ["Destined for stardom.", "The Telescope turns to you menacingly."];
                this.flavourTextLow = "The Telescope has lost contact with ground control.";
                break;
			case "Printer":
                this.maxHP = 15;
                this.str = 6;
                this.arm = 1;
                this.reward = 120000;
                this.flavourText = ["Printer is trying to justify why it's here.", "It's too col-late to turn back.",
					"Printer is taking a bold approach.", "Printer feels this battle is one-sided."];
                this.flavourTextLow = "Printer is bleeding cyan, yellow and magenta.";
                break;
			case "VHS Player":
                this.maxHP = 80;
                this.str = 5;
                this.arm = 2;
                this.reward = 0;
                this.flavourText = ["So much to do, so much to see.", "Anything is possible!",
					"Make it your own!", "The future of entertainment!", "The whole world in your hand!",
					"The sky's the limit!", "What would you like to do?", "Record-breaking!",
					"Fast forward to tomorrow!", "The media format you can trust!",
					"Store your precious memories in the format you can trust!"];
                this.flavourTextLow = "Generation loss.";
                break;
        }
        this.HP = this.maxHP; // set their HP to full
    }
}