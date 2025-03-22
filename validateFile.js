function validateFile(gameFileObject) {
    // This function returns whether the file object is valid. It returns false when it encounters its first error.
    // The console also states the reason why the file was rejected.

    // Uncomment to fail, for testing purposes:
    // return false;

    // Step 0; Check object exists
    if (!gameFileObject || typeof(gameFileObject) != "object") {
        console.log("Save validation error: No save object.")
        return false;
    }

    // Step 1;  Check each base key exists
    let fields = ["game", "currentPlayer", "spareBots", "currentLevel"]
    for (let key = 0; key < 4; key++) {
        if (!(fields[key] in gameFileObject)) {
            console.log("Save validation error: Key " + fields[key] + " not found.")
            return false;
        }
    }


    // Step 2; Check all subkeys exist
    // game
    if (!("botNumber" in gameFileObject["game"] && "mode" in gameFileObject["game"])) {
        console.log("Save validation error: missing game state field.")
        return false;
    }

    // currentPlayer
    fields = ["position", "inventory", "credits", "name", "HP", "maxHP", "str", "arm", "dex", "int", "cha", "dream",
        "favFood"]
    for (let key = 0; key < fields.length; key++) {
        if (!(fields[key] in gameFileObject["currentPlayer"])) {
            console.log("Save validation error: Key currentPlayer." + fields[key] + " not found.")
            return false;
        }
    }

    // spareBots is checked in a separate step
    // currentLevel
    fields = ["grid", "spawnPoint", "encounters", "pois"]
    for (let key = 0; key < fields.length; key++) {
        if (!(fields[key] in gameFileObject["currentLevel"])) {
            console.log("Save validation error: Key currentLevel." + fields[key] + " not found.")
            return false;
        }
    }

    // Step 3; Check number of spareBots matches what is expected
    if (gameFileObject["game"]["botNumber"] !== 4 - gameFileObject["spareBots"].length) {
        console.log("Save validation error: botNumber contradicts spareBots array length.")
        return false;
    }

    // Step 4; Check all data types are expected
    // This could get a bit verbose so hold onto your hats, folks
    // Typeof always returns a string, and we are mostly testing the data types of fields contained within a sub-object,
    // so I am going to implement this check as iterating through an array of 3-element sub-arrays:
    // typeof(gameFileObject[<0>][<1>]) == <2>
    // The rest are checked in the highly miscellaneous Step 5.

    let typesTemp = [
        ["game", "botNumber", "number"],
        ["game", "mode", "string"],
        ["currentPlayer", "position", "object"],
        ["currentPlayer", "inventory", "object"],
        ["currentPlayer", "credits", "number"],
        ["currentPlayer", "name", "string"],
        ["currentPlayer", "HP", "number"],
        ["currentPlayer", "maxHP", "number"],
        ["currentPlayer", "str", "number"],
        ["currentPlayer", "arm", "number"],
        ["currentPlayer", "dex", "number"],
        ["currentPlayer", "int", "number"],
        ["currentPlayer", "cha", "number"],
        ["currentPlayer", "dream", "string"],
        ["currentPlayer", "favFood", "string"],
        ["currentLevel", "grid", "object"],
        ["currentLevel", "spawnPoint", "object"],
        ["currentLevel", "encounters", "object"],
        ["currentLevel", "pois", "object"]
    ]

    for (let i = 0; i < typesTemp.length; i++) {
        if (typeof(gameFileObject[typesTemp[i][0]][typesTemp[i][1]]) != typesTemp[i][2]) {
            console.log("Save validation error: Field " + typesTemp[i][0] + "." + typesTemp[i][1] + " is not type " +
                typesTemp[i][2]);
            return false;
        }
    }

    // Step 5; check all data values are valid
    /* This only checks that loaded values will not cause an exception or other undefined behaviour - for example, it
    will ensure the player's maxHP is an integer and above zero, however it will not check how big this above zero
    number is, as setting the player's HP to 1 billion does not affect anything internally. */

        // game.botNumber must be an integer between 0 and 4 inclusive
    if (!Number.isInteger(gameFileObject["game"]["botNumber"])) {
        console.log("Save validation error: game.botNumber must be an integer");
        return false;
    }
    if (gameFileObject["game"]["botNumber"] < 0 || gameFileObject["game"]["botNumber"] > 4) {
        console.log("Save validation error: game.botNumber must be between 0 and 4 inclusive.");
        return false;
    }

        // game.mode must be in the following format:
        // "o1", "o2", ... "o10" for overworld levels 1-10, "v1", ... "v3" for vaults and "e0" for escape
    if (gameFileObject["game"]["mode"][0] == "o") {
        let n = Number(gameFileObject["game"]["mode"].slice(1));
        // Check it is an integer - this also catches out NaN
        if (!Number.isInteger(n)) {
            console.log("Save validation error: Invalid overworld level number.");
            return false;
        }
        if (n < 1 || n > 10) {
            console.log("Save validation error: Invalid overworld level number.");
            return false;
        }
    } else if (gameFileObject["game"]["mode"][0] == "v") {
        let n = Number(gameFileObject["game"]["mode"].slice(1));
        // Check it is an integer - this also catches out NaN
        if (!Number.isInteger(n)) {
            console.log("Save validation error: Invalid vault level number.");
            return false;
        }
        if (n < 1 || n > 3) {
            console.log("Save validation error: Invalid vault level number.");
            return false;
        }
    } else if (gameFileObject["game"]["mode"][0] != "e") { // We don't really care what "e" has after it
        return false;
    }

        // currentPlayer.position is an array of length 2 and is an integer within range. Arrays and {} objects are both
        // "object" type according to typeof(), but .length returns undefined for {} objects, so while it is
        //  distressing, it works perfectly fine.
            // Correct length (and an array)
    if (gameFileObject["currentPlayer"]["position"].length != 2) {
        console.log("Save validation error: Invalid player position array");
        return false;
    }
            // Integer
    if (!Number.isInteger(gameFileObject["currentPlayer"]["position"][0]) ||
        !Number.isInteger(gameFileObject["currentPlayer"]["position"][1])) {
        console.log("Save validation error: Invalid player position");
        return false;
    }
            // Within range of level
    if (gameFileObject["currentPlayer"]["position"][0] < 0 || gameFileObject["currentPlayer"]["position"][0] > 24 ||
        gameFileObject["currentPlayer"]["position"][1] < 0 || gameFileObject["currentPlayer"]["position"][1] > 24) {
        console.log("Save validation error: Invalid player position");
        return false;
    }

        // currentPlayer.inventory is an array of valid objects
            // Check it is an array and one of a valid length
    if (!(gameFileObject["currentPlayer"]["inventory"].length < 9)) {
        console.log("Save validation error: Invalid inventory");
        return false;
    }

            // Check each object is valid
    for (let slotNum = 0; slotNum < gameFileObject["currentPlayer"]["inventory"].length; slotNum++) {
        if (!("item" in gameFileObject["currentPlayer"]["inventory"][slotNum] &&
            "count" in gameFileObject["currentPlayer"]["inventory"][slotNum])) {
            console.log("Save validation error: Invalid item object in slot" + slotNum);
            return false;
        }

            // Check that the item has a valid ID. "in" does not work for string arrays so we're doing it the long way
        let itemIDValid = false;
        for (let i = 0; i < items.length; i++) {
            if (gameFileObject["currentPlayer"]["inventory"][slotNum]["item"] == items[i]) {
                itemIDValid = true;
                break;
            }
        }

        if (!itemIDValid) {
            console.log("Save validation error: Invalid item ID in slot " + slotNum);
            return false;
        }

            // Check that the item count is valid
        if (!Number.isInteger(gameFileObject["currentPlayer"]["inventory"][slotNum]["count"]) ||
            gameFileObject["currentPlayer"]["inventory"][slotNum]["count"] < 1) {
            console.log("Save validation error: Invalid item count in slot " + slotNum);
            return false;
        }
    }

        // currentPlayer.credits is a valid integer
    if (!Number.isInteger(gameFileObject["currentPlayer"]["credits"]) ||
        gameFileObject["currentPlayer"]["credits"] < 0) {
        console.log("Save validation error: Invalid number of credits.");
        return false;
    }

        // currentPlayer.maxHP and HP are valid integers. The lack of inclusion of HP being above maximum is deliberate.
    if (!Number.isInteger(gameFileObject["currentPlayer"]["maxHP"]) ||
        gameFileObject["currentPlayer"]["maxHP"] < 0) {
        console.log("Save validation error: Invalid player max HP.");
        return false;
    }

    if (!Number.isInteger(gameFileObject["currentPlayer"]["HP"]) ||
        gameFileObject["currentPlayer"]["HP"] < 0) {
        console.log("Save validation error: Invalid player max HP.");
        return false;
    }

        // all stats in currentPlayer are integers
    let stats = ["str", "arm", "dex", "int", "cha"];
    for (let statN = 0; statN < 5; statN++) {
        if (!Number.isInteger(gameFileObject["currentPlayer"][stats[statN]])) {
            console.log("Save validation error: Invalid player stat " + stats[statN]);
            return false;
        }
    }

        // currentPlayer.dream is valid
    let dreamValid = false;
    for (let i = 0; i < dreams.length; i++) {
        if (gameFileObject["currentPlayer"]["dream"] == dreams[i]) {
            dreamValid = true;
            break;
        }
    }
    if (!dreamValid) {
        console.log("Save validation error: Invalid player dream ID.")
        return false;
    }

        // currentPlayer.favFood is valid.
    let foodValid = false;
    for (let i = 0; i < items.length; i++) {
        if (gameFileObject["currentPlayer"]["favFood"] == items[i]) {
            foodValid = true;
            break;
        }
    }
    if (!foodValid) {
        console.log("Save validation error: Invalid player favourite food.")
        return false;
    }

        // level.grid is 25x25
            // Check it has 25 rows
    if (gameFileObject["currentLevel"]["grid"].length != 25) {
        console.log("Save validation error: Invalid level grid array");
        return false;
    }
            // Check each of the 25 rows has 25 columns
    for (let i = 0; i < 25; i++) {
        if (gameFileObject["currentLevel"]["grid"][i].length != 25) {
            console.log("Save validation error: Invalid level grid array");
            return false;
        }
    }

            // Check each of the 625 cells are 0 or 1. This also automatically sorts out checking the data type
    for (let x = 0; x < 25; x++) {
        for (let y = 0; y < 25; y++) {
            if (gameFileObject["currentLevel"]["grid"][x][y] != 0 &&
                gameFileObject["currentLevel"]["grid"][x][y] != 1) {
                console.log("Save validation error: Invalid tile at X: " + x + ", Y: " + y);
            }
        }
    }

        // level.spawnPoint is an array of 2 integers within range
    if (!Number.isInteger(gameFileObject["currentLevel"]["spawnPoint"][0]) ||
        !Number.isInteger(gameFileObject["currentLevel"]["spawnPoint"][1])) {
        console.log("Save validation error: Invalid spawn point position");
        return false;
    }
    if (gameFileObject["currentLevel"]["spawnPoint"][0] < 0 || gameFileObject["currentLevel"]["spawnPoint"][0] > 24 ||
        gameFileObject["currentLevel"]["spawnPoint"][1] < 0 || gameFileObject["currentLevel"]["spawnPoint"][1] > 24) {
        console.log("Save validation error: Invalid spawn point position");
        return false;
    }

        // level.encounters contains valid objects
    let typeValid = false;
    for (let e = 0; e < gameFileObject["currentLevel"]["encounters"].length; e++) {
            // Check that the fields exist
        if (!("type" in gameFileObject["currentLevel"]["encounters"][e] &&
            "pos" in gameFileObject["currentLevel"]["encounters"][e])) {
            console.log("Save validation error: Missing key in level encounter.");
            return false;
        }

            // Check that type is a valid enemy type
        typeValid = false;
        for (let i = 0; i < enemies.length; i++) {
            if (gameFileObject["currentLevel"]["encounters"][e]["type"] == enemies[i]) {
                typeValid = true;
                break;
            }
        }
        if (!typeValid) {
            console.log("Save validation error: Invalid enemy type " + gameFileObject["currentLevel"]["encounters"][e]["type"]);
            return false;
        }
            // Check that pos is an array
        if (typeof(gameFileObject["currentLevel"]["encounters"][e]["pos"]) != "object") {
            console.log("Save validation error: Invalid enemy position.")
            return false;
        }
            // Check array is right length
        if (gameFileObject["currentLevel"]["encounters"][e]["pos"].length != 2) {
            console.log("Save validation error: Invalid enemy position.")
            return false;
        }

            // Check position is within bounds
        if (gameFileObject["currentLevel"]["encounters"][e]["pos"][0] < 0 ||
            gameFileObject["currentLevel"]["encounters"][e]["pos"][0] > 24 ||
            gameFileObject["currentLevel"]["encounters"][e]["pos"][1] < 0 ||
            gameFileObject["currentLevel"]["encounters"][e]["pos"][1] > 24) {
            console.log("Save validation error: Invalid enemy position");
            return false;
        }


    }

    // level.pois contains valid objects - very similar in implementation to encounters
    typeValid = false;
    for (let p = 0; p < gameFileObject["currentLevel"]["pois"].length; p++) {
        // Check that the fields exist
        if (!("type" in gameFileObject["currentLevel"]["pois"][p] &&
            "pos" in gameFileObject["currentLevel"]["pois"][p])) {
            console.log("Save validation error: Missing key in level encounter.");
            return false;
        }

        // Check that type is a valid enemy type
        typeValid = false;
        for (let i = 0; i < pois.length; i++) {
            if (gameFileObject["currentLevel"]["pois"][p]["type"] == pois[i]) {
                typeValid = true;
                break;
            }
        }
        if (!typeValid) {
            console.log("Save validation error: Invalid POI type found.");
            return false;
        }
        // Check that pos is an array
        if (typeof(gameFileObject["currentLevel"]["pois"][p]["pos"]) != "object") {
            console.log("Save validation error: Invalid POI position.")
            return false;
        }
        // Check array is right length
        if (gameFileObject["currentLevel"]["pois"][p]["pos"].length != 2) {
            console.log("Save validation error: Invalid POI position.")
            return false;
        }

        // Check position is within bounds
        if (gameFileObject["currentLevel"]["pois"][p]["pos"][0] < 0 ||
            gameFileObject["currentLevel"]["pois"][p]["pos"][0] > 24 ||
            gameFileObject["currentLevel"]["pois"][p]["pos"][1] < 0 ||
            gameFileObject["currentLevel"]["pois"][p]["pos"][1] > 24) {
            console.log("Save validation error: Invalid POI position");
            return false;
        }


    }


    // Check spareBots separately - this is a variable length list of objects, and so we have multiple layers to this:
    // 1. Check each field in each exists
    // 2. Check each field in each is of a valid type
    // 3. Check each field in each is a valid value

    typesTemp = [
        ["name", "string"],
        ["maxHP", "number"],
        ["str", "number"],
        ["arm", "number"],
        ["dex", "number"],
        ["int", "number"],
        ["cha", "number"],
        ["dream", "string"],
        ["favFood", "string"]
    ]
    fields = ["maxHP", "str", "arm", "dex", "int", "cha"]; // Reused to check the values that should be integers
    for (let botNumber = 0; botNumber < gameFileObject["spareBots"].length; botNumber++) {
        // Check each field exists and is of a valid type
        for (let key = 0; key < typesTemp.length; key++) {
            if (!(typesTemp[key][0] in gameFileObject["spareBots"][botNumber])) {
                console.log("Save validation error: Key spareBot[" + botNumber + "]." + typesTemp[key][0] +
                    " not found.")
                return false;
            }
            if (typeof(gameFileObject["spareBots"][botNumber][typesTemp[key][0]]) != typesTemp[key][1]) {
                console.log("Save validation error: Key spareBot[" + botNumber + "]." + typesTemp[key][0] +
                    " is of invalid type.")
                return false;
            }
        }

        // Check each field has a valid value
        if (name.length > 10) {
            console.log("Save validation error: spareBot[" + botNumber + "] has invalid name length.");
        }

        // Check maxHP, str, arm, dex, int and cha are all integers
        for (let i = 0; i < 6; i++) {
            if (!Number.isInteger(gameFileObject["spareBots"][botNumber][fields[i]])) {
                console.log("Save validation error: spareBot[" + botNumber + "] has invalid stat for " + fields[i]);
                return false;
            }
        }

        // Check maxHP is above zero
        if (gameFileObject["spareBots"][botNumber]["maxHP"] < 1) {
            console.log("Save validation error: spareBot[" + botNumber + "] has invalid HP value.");
            return false;
        }

        // dream is valid
        dreamValid = false;
        for (let i = 0; i < dreams.length; i++) {
            if (gameFileObject["spareBots"][botNumber]["dream"] == dreams[i]) {
                dreamValid = true;
                break;
            }
        }
        if (!dreamValid) {
            console.log("Save validation error: spareBot[" + botNumber + "] has invalid dream ID.")
            return false;
        }

        // favFood is valid
        foodValid = false;
        for (let i = 0; i < items.length; i++) {
            if (gameFileObject["spareBots"][botNumber]["favFood"] == items[i]) {
                foodValid = true;
                break;
            }
        }
        if (!foodValid) {
            console.log("Save validation error: spareBot[" + botNumber + "] has invalid favourite food.")
            return false;
        }
    }

    // As all failed checks return false, if the program gets here, we have a valid file
    return true;
}