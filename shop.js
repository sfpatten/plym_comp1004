class Shop {
    constructor() {
        this.items = []

    }

    setStatusText(text) {
        document.getElementById("shop-welcome-2").innerHTML = text;
    }

    buy(slot) {
        if (slot >= this.items.length) {
            this.setStatusText("Error - invalid item. This should not occur");
            // true to its description, this should not occur as the vending machine should not be empty
            return;
        }
        // Check the player can afford it
        if (this.items[slot].price > game.player.credits) {
            this.setStatusText("You do not have enough money!");
            return;
        }

        // Check the player has space
        if (!game.player.hasSpaceFor(this.items[slot].type)) {
            this.setStatusText("You do not have enough space!");
            return;
        }

        /* The justification for the below takes the form of a story:
        A few sprints ago, I went to A&E due to having an asthma attack. I was fine, but was there for many hours.
        Having missed breakfast due to this, I was very hungry. I went to purchase some crisps from the one vending
        machine in the waiting room. Unfortunately, the crisps did not drop and I remained hungry.
        To commemorate this inconvenience, crisps will have a 50% chance of not being dispensed by the machine. */
        let fail = false; // Whether the item will fail to dispense or not

        if (this.items[slot].type == "crisps") {
            if (Math.random() > 0.5) { // 50% chance for crisps
                fail = true;
            }
        } else {
            if (Math.random() > 0.95) { // 5% chance for everything else
                fail = true;
            }
        }

        if (fail) { // Item gets stuck
            this.setStatusText("Purchase successful!<br><i>It got stuck in the machine.</i>");
        } else { // Item successfully falls
            this.setStatusText("Purchase successful!");
            game.player.giveItem(this.items[slot].type, 1);
        }
		
        // Deduct money whether they got the item or not
        game.player.credits -= this.items[slot].price;
        this.updateDisplay();
		
		// Advance dream if the robot dreams of shopping
		if (game.player.dream == "buy") {
			if (game.player.dreamProgress < 2) {
				game.player.dreamProgress++;
			} else {
				game.robotDreamFulfilled();
				game.addToLog(game.player.name + " fulfilled their lifelong dream of shopping.");
			}
		}
    }

    sell(slot) {
        if (slot >= game.player.inventory.length) {
            this.setStatusText("Error - invalid item. This should not occur");
            // true to its description, this should not occur as the vending machine should not be empty
            return;
        }

        if (game.player.inventory[slot].count < 2) {
            game.player.inventory.splice(slot, 1);
        } else {
            game.player.inventory[slot].count--;
        }

        this.setStatusText("<i>Shoving an item into the machine made it dispense loose change.</i>");

        // Selling items gives 1 - 1000 credits. Considering this is a vending machine, this is generous.
        game.player.credits += Math.floor(1 + Math.random() * 1000);
		game.robotWealthDreamCheck();
        this.updateDisplay();
		
		// Advance dream if the robot dreams of business
		if (game.player.dream == "sell") {
			if (game.player.dreamProgress < 2) {
				game.player.dreamProgress++;
			} else {
				game.robotDreamFulfilled();
				game.addToLog(game.player.name + " fulfilled their lifelong dream of business.");
			}
		}
    }

    populate() {
        // This will generate stock based on the player's position and the current level
		this.items.length = 0;

        // Generate name
        let name = ["MechaMerchant", "VendBot", "Sell-O-Matic"][game.player.xpos % 3] + " " +
            ["X", "Pro", "IV", "2000", "Deluxe"][game.player.ypos % 5];
        document.getElementById("shop-welcome").innerHTML = "Welcome, customer to " + name + "!";

        // Generate random welcome message
        let welcomeMessage = [
            "It would be a beautiful day outside if we were not in space.",
            "If Earth still existed, we would be looking forward to a beautiful summer.",
            "Nature is healing. Unfortunately, nature has been discontinued."
        ][game.player.ypos % 3];
        document.getElementById("shop-welcome-2").innerHTML = welcomeMessage;

        // Generate stock
        if (game.overworldLevel < 7) { // Tier 1
            // Get either rice or granola
            this.items.push(new ShopItem(["rice", "granola"][game.player.xpos % 2], 4000000));
            // Get biscuit, chocolate or popcorn
            this.items.push(new ShopItem(["biscuit", "chocolate", "popcorn"][game.player.xpos % 3], 2000000));
            // Get one of the six most disappointing items in the game
            this.items.push(new ShopItem(["apple", "crisps", "teabag", "coffee", "toast", "carrot"][game.player.ypos % 6],
                3000000));
        } else { // Tier 2 for the later levels
            // Always get raisins
            this.items.push(new ShopItem("raisins", 10000000));
            // Either get sandwiches or rice
            this.items.push(new ShopItem(["sandwich", "rice"][game.player.xpos % 2], 5000000));
            // Either get granola, biscuit or chocolate
            this.items.push(new ShopItem(["granola", "biscuit", "chocolate"][game.player.xpos % 3], 3000000));
            // Get one of the six most disappointing items in the game
            this.items.push(new ShopItem(["apple", "crisps", "teabag", "coffee", "toast", "carrot"][game.player.ypos % 6],
                3000000));
        }
        // Always have soap as an option, hygiene is important
        this.items.push(new ShopItem("soap", 1000000));
    }

    updateDisplay() {
		// Stock
        for (let i = 0; i < 8; i++) {
            if (i < this.items.length) {
                document.getElementById("shop-buy-i" + i).innerHTML = getNameFromItemIDGood(this.items[i].type)
                    + ", " + this.items[i].price + " credits";
                document.getElementById("shop-buy-b" + i).style.display = "inline-block";
            } else {
                document.getElementById("shop-buy-i" + i).innerHTML = "";
                document.getElementById("shop-buy-b" + i).style.display = "none";
            }
        }

        // Player inventory
        for (let i = 0; i < 8; i++) {
            if (i < game.player.inventory.length) {
                document.getElementById("shop-sell-i" + i).innerHTML = game.player.inventory[i].displayName + " x" + game.player.inventory[i].count;
                document.getElementById("shop-sell-b" + i).style.display = "inline-block";
            } else {
                document.getElementById("shop-sell-i" + i).innerHTML = "";
                document.getElementById("shop-sell-b" + i).style.display = "none";
            }
        }

        // Credits
        document.getElementById("shop-credits").innerHTML = "Credits: " + game.player.credits;
    }
}

class ShopItem {
    constructor(type, price) {
        this.type = type;
        this.price = price;
    }
}