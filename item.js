class Item {
    constructor(type, count) {
        this.type = type;
        this.count = count; // should be an integer above zero for obvious reasons

        switch (type) {
            case "apple":
                this.displayName = "Unripe Apple";
                this.useText = "The apple is unpleasantly bitter. (+5 HP)";
                this.consumable = true;
                this.consumeHP = 5;
                break;
            case "carrot":
                this.displayName = "Broken Carrot";
                this.useText = "It tastes broken. (+2 HP)";
                this.consumable = true;
                this.consumeHP = 2;
                break;
            case "rice":
                this.displayName = "Overcooked Rice";
                this.useText = "The rice has somehow been cooked to the consistency of modelling clay. (+8 HP)";
                this.consumable = true;
                this.consumeHP = 8;
                break;
            case "raisins":
                this.displayName = "Raisins";
                this.useText = "<b>Raisins.</b>";
                this.consumable = true;
                this.consumeHP = 20; // delicious
                break;
            case "toast":
                this.displayName = "Burnt Toast";
                this.useText = "The toast is somehow still warm. (+3 HP)";
                this.consumable = true;
                this.consumeHP = 3;
                break;
            case "soap":
                this.displayName = "Unscented Soap";
                this.useText = "Biting into the soap, I felt ashamed. (-1 HP; +1 Shame)";
                this.consumable = true;
                this.consumeHP = -1;
                break;
            case "biscuit":
                this.displayName = "Crushed biscuit";
                this.useText = "It tastes like a cheese-free cheesecake. (+6 HP)";
                this.consumable = true;
                this.consumeHP = 6;
                break;
            case "teabag":
                this.displayName = "Tea Bag";
                this.useText = "A savoury snack. (+4 HP)";
                this.consumable = true;
                this.consumeHP = 4;
                break;
            default: // The wooden spoon is intended to be unobtainable, so, obviously, if it is obtainable, something has gone severely wrong.
                this.displayName = "Wooden Spoon";
                this.useText = "There is nothing you can do with this.";
                this.consumable = false;
                this.consumeHP = 0;
                break;
        }
    }
}
