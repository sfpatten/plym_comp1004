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
                this.useText = "Biting into the soap, you felt ashamed, yet also hygienic. (-1 HP; +1 Shame)";
                this.consumable = true;
                this.consumeHP = -1;
                break;
            case "biscuit":
                this.displayName = "Crushed Biscuit";
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
            case "crisps":
                this.displayName = "Stale Crisps";
                this.useText = "The crisps do not crunch. (+5 HP)";
                this.consumable = true;
                this.consumeHP = 5;
                break;
            case "chocolate":
                this.displayName = "Chocolate";
                this.useText = "It's white chocolate. (+6 HP)";
                this.consumable = true;
                this.consumeHP = 6;
                break;
            case "granola":
                this.displayName = "Frozen Granola";
                this.useText = "Why is the granola frozen? You are unsure. (+7 HP)";
                this.consumable = true;
                this.consumeHP = 7;
                break;
            case "coffee":
                this.displayName = "Bottle of Coffee";
                this.useText = "You slurp the coffee out of the glass bottle, and then eat the bottle. (+4 HP)";
                this.consumable = true;
                this.consumeHP = 4;
                break;
            case "popcorn":
                this.displayName = "Popcorn";
                this.useText = "Most of the kernels are unpopped. (+6 HP)";
                this.consumable = true;
                this.consumeHP = 6;
                break;
            case "sandwich":
                this.displayName = "Squashed sandwich";
                this.useText = "The butter inside the sandwich is crunchy. (+10 HP)";
                this.consumable = true;
                this.consumeHP = 10;
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
