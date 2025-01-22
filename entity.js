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