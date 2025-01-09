class Item {
    constructor(type) {
        this.type = type;
        this.displayName = "Wooden Spoon";
        this.useText = "There is nothing you can do with this.";
        this.consumeHP = 0; // A non-consumable item will have a value of 0, which will be detected to prevent its consumption.
        switch (type) {
            case "apple":
                this.displayName = "Unripe Apple";
                this.useText = "The apple is unpleasantly bitter. (+5 HP)";
                this.consumeHP = 5;
                break;
            case "carrot":
                this.displayName = "Broken Carrot";
                this.useText = "It tastes broken. (+2 HP)";
                this.consumeHP = 2;
                break;
            case "rice":
                this.displayName = "Overcooked Rice";
                this.useText = "The rice has somehow been cooked to the consistency of modelling clay. (+8 HP)";
                this.consumeHP = 8;
                break;
            case "raisins":
                this.displayName = "Raisins";
                this.useText = "<b>Raisins.</b>";
                this.consumeHP = 20; // delicious
                break;
            case "toast":
                this.displayName = "Burnt Toast";
                this.useText = "The toast is somehow still warm. (+3 HP)";
                this.consumeHP = 3;
                break;
            case "soap":
                this.displayName = "Unscented Soap";
                this.useText = "Biting into the soap, I felt ashamed. (-1 HP; +1 Shame)";
                this.consumeHP = -1;
                break;
            case "biscuit":
                this.displayName = "Crushed biscuit";
                this.useText = "It tastes like a cheese-free cheesecake. (+6 HP)";
                this.consumeHP = 6;
                break;
            case "teabag":
                this.displayName = "Tea Bag";
                this.useText = "A savoury snack. (+4 HP)";
                this.consumeHP = 4;
                break;
        }
    }
}