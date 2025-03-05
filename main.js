
class Game {
    constructor() {
        this.botNumber = 0;
        this.spareBots = [];
        this.overworld = new Level(25);
        this.overworldLevel = 1;
        this.player = new Player();
        this.mode = "start";
        this.battle = null;
        this.flight = null;
        this.fileTemp = null; // Used in loading files
    }

    loadFile() {
        // This assumes the file has been validated because that is the only way fileTemp should be populated, and the
        // button triggering this function to be available.

        this.botNumber = this.fileTemp["game"]["botNumber"];
        // Current player
        this.player.name = this.fileTemp["currentPlayer"]["name"];
        this.player.HP = this.fileTemp["currentPlayer"]["HP"];
        this.player.maxHP = this.fileTemp["currentPlayer"]["maxHP"];
        this.player.str = this.fileTemp["currentPlayer"]["str"];
        this.player.arm = this.fileTemp["currentPlayer"]["arm"];
        this.player.dex = this.fileTemp["currentPlayer"]["dex"];
        this.player.int = this.fileTemp["currentPlayer"]["int"];
        this.player.cha = this.fileTemp["currentPlayer"]["cha"];
        this.player.dream = this.fileTemp["currentPlayer"]["dream"];
        this.player.favFood = this.fileTemp["currentPlayer"]["favFood"];
        this.player.credits = this.fileTemp["currentPlayer"]["credits"];
        this.player.xpos = this.fileTemp["currentPlayer"]["position"][0];
        this.player.ypos = this.fileTemp["currentPlayer"]["position"][1];

            // Inventory
        this.player.inventory.length = 0;
        for (let slot = 0; slot < this.fileTemp["currentPlayer"]["inventory"].length; slot++) {
            this.player.inventory.push(new Item(this.fileTemp["currentPlayer"]["inventory"][slot]["item"],
                this.fileTemp["currentPlayer"]["inventory"][slot]["count"]));
        }

        // Spare robots (if any left)
        this.spareBots.length = 0;
        for (let botNum = 0; botNum < this.fileTemp["spareBots"].length; botNum++) {
            this.spareBots.push(new SpareBot(this.fileTemp["spareBots"][botNum]["name"],
                this.fileTemp["spareBots"][botNum]["maxHP"], this.fileTemp["spareBots"][botNum]["str"],
                this.fileTemp["spareBots"][botNum]["arm"], this.fileTemp["spareBots"][botNum]["dex"],
                this.fileTemp["spareBots"][botNum]["int"], this.fileTemp["spareBots"][botNum]["cha"],
            this.fileTemp["spareBots"][botNum]["dream"], this.fileTemp["spareBots"][botNum]["favFood"]));
        }

        let modeTemp = this.fileTemp["game"]["mode"];
        if (modeTemp[0] == "o") { // There is no need to initialise overworld if the player is in the vault or exiting
            this.overworldLevel = Number(modeTemp.slice(1));

            // Overworld level
                // Grid
            for (let x = 0; x < 25; x++) {
                for (let y = 0; y < 25; y++) {
                    this.overworld.levelGrid[x][y] = this.fileTemp["currentLevel"]["grid"][x][y];
                }
            }

                // Spawn point
            this.overworld.spawnPoint = this.fileTemp["currentLevel"]["spawnPoint"];

                // Encounters
            this.overworld.encounters.length = 0;
            for (let e = 0; e < this.fileTemp["currentLevel"]["encounters"].length; e++) {
                this.overworld.encounters.push(new Encounter(this.fileTemp["currentLevel"]["encounters"][e]["pos"][0],
                    this.fileTemp["currentLevel"]["encounters"][e]["pos"][1],
                    this.fileTemp["currentLevel"]["encounters"][e]["type"]))
            }

                // POIs
            this.overworld.pois.length = 0;
            for (let e = 0; e < this.fileTemp["currentLevel"]["pois"].length; e++) {
                this.overworld.pois.push(new POI(this.fileTemp["currentLevel"]["pois"][e]["pos"][0],
                    this.fileTemp["currentLevel"]["pois"][e]["pos"][1],
                    this.fileTemp["currentLevel"]["pois"][e]["type"]))
            }

            this.setMode("overworld");
            renderMap();
            updateInventoryDisplay();
            updateStatDisplay();
        } else {
            console.log("Not yet implemented."); // TODO: add file loading for vault and escape when implemented
        }
    }

    setMode(newMode) {
        // i need to make a method that hides EVERYTHING and then unhides the correct thing
        document.getElementById("overworld-grid").style.display="none";
        document.getElementById("battle-box").style.display="none";
        document.getElementById("fly-box").style.display="none";
        document.getElementById("death-screen-box").style.display="none";
        document.getElementById("start-screen-box").style.display="none";
        document.getElementById("save-box").style.display="none";
        document.getElementById("load-box").style.display="none";
        document.getElementById("main-menu-box").style.display="none";
        if (newMode == "main-menu") {
            document.getElementById("main-menu-box").style.display = "block";
        } else if (newMode == "overworld") {
            document.getElementById("overworld-grid").style.display="grid";
            updateStatDisplay();
            updateInventoryDisplay();
            this.mode = "overworld";
        } else if (newMode == "battle") {
            document.getElementById("battle-box").style.display="block";
            this.mode = "battle";
        } else if (newMode == "death") {
            document.getElementById("death-screen-box").style.display="block";
            this.mode = "death";
        } else if (newMode == "start") {
            document.getElementById("start-screen-box").style.display="block";
            this.mode = "start";
        } else if (newMode == "fly") {
            document.getElementById("fly-box").style.display="block";
            this.mode = "fly";
        }
    }

    openSaveScreen() {
        document.getElementById("overworld-grid").style.display="none";
        document.getElementById("battle-box").style.display="none";
        document.getElementById("fly-box").style.display="none";
        document.getElementById("death-screen-box").style.display="none";
        document.getElementById("start-screen-box").style.display="none";
        document.getElementById("save-box").style.display="none";
        document.getElementById("save-box").style.display="block";
        document.getElementById("save-download").style.display="none";
        document.getElementById("save-why").style.display="none";
        document.getElementById("save-options").style.display="block";
    }

    closeSaveScreen() {
        document.getElementById("save-box").style.display="none";
        if (this.mode == "overworld") {
            document.getElementById("overworld-grid").style.display="grid";
        } else if (this.mode == "battle") {
            document.getElementById("battle-box").style.display="block";
        } else if (this.mode == "death") {
            document.getElementById("death-screen-box").style.display="block";
        } else if (this.mode == "start") {
            document.getElementById("start-screen-box").style.display="block";
        } else if (this.mode == "fly") {
            document.getElementById("fly-box").style.display="block";
        }
    }

    openLoadScreen() {
        document.getElementById("main-menu-box").style.display="none";
        document.getElementById("load-box").style.display="block";

        // Validate our local save file to decide what to do next
        let file = JSON.parse(localStorage["saveGame"])
        let validFile = validateFile(file);

        if (validFile) {
            this.fileTemp = file;
            document.getElementById("load-status").innerHTML = "A save file has been detected:"
            document.getElementById("load-upload-prompt").innerHTML = "You can also upload a local save file below:";
            document.getElementById("load-new-file-prompt").innerHTML = "Otherwise, you can start a new game here:";
            document.getElementById("load-file-valid").style.display = "block";
            document.getElementById("load-you-name").innerHTML = file["currentPlayer"]["name"];
            document.getElementById("load-you-HP").innerHTML = "HP: " + file["currentPlayer"]["HP"] + "/" +
                file["currentPlayer"]["maxHP"];
            let tempLevel = file["game"]["mode"];
            if (tempLevel[0] == "o") {
                document.getElementById("load-you-level").innerHTML = "Level " + tempLevel.slice(1);
            } else if (tempLevel[0] == "v") {
                document.getElementById("load-you-level").innerHTML = "The Vault";
            } else if (tempLevel[0] == "e") {
                document.getElementById("load-you-level").innerHTML = "The Escape";
            }
            // console.log("valid file in local storage :)"); // This line of code was a reassuring presence for the nine hours it took to implement save file validation, I'm not yet ready to say goodbye to it
        } else {
            document.getElementById("load-status").innerHTML = "No save file has been detected:"
            document.getElementById("load-upload-prompt").innerHTML = "You can upload a local save file below:";
            document.getElementById("load-new-file-prompt").innerHTML = "Otherwise, you can start a new game here:";
            document.getElementById("load-file-valid").style.display = "none";
            // If there is no valid file, we will hide the "load-you" div and indicate that the player must either
            // upload a file or start a new game.

        }
    }

    localLoadFromUploadedFile() { // Assumes openLoadScreen() has already been called
        let fileListTemp = document.getElementById("load-file-input").files;
        if (fileListTemp.length > 0) {
            let reader = new FileReader();
            // It's time for some asynchronous antics here, with a lambda function to respond once it's finished
            reader.onload = function () {
                try {
                    let parsedData = JSON.parse(reader.result);
                    if (validateFile(parsedData)) {
                        game.fileTemp = parsedData;
                        document.getElementById("load-status").innerHTML = "You have uploaded the following file:";
                        document.getElementById("load-upload-prompt").innerHTML = "You can upload another local save file below:";
                        document.getElementById("load-you-name").innerHTML = game.fileTemp["currentPlayer"]["name"];
                        document.getElementById("load-you-HP").innerHTML = "HP: " + game.fileTemp["currentPlayer"]["HP"] + "/" +
                            game.fileTemp["currentPlayer"]["maxHP"];
                        let tempLevel = game.fileTemp["game"]["mode"];
                        if (tempLevel[0] == "o") {
                            document.getElementById("load-you-level").innerHTML = "Level " + tempLevel.slice(1);
                        } else if (tempLevel[0] == "v") {
                            document.getElementById("load-you-level").innerHTML = "The Vault";
                        } else if (tempLevel[0] == "e") {
                            document.getElementById("load-you-level").innerHTML = "The Escape";
                        }
                    } else {
                        document.getElementById("load-upload-prompt").innerHTML = "Invalid file. You can try uploading another:";
                    }
                } catch {
                    document.getElementById("load-upload-prompt").innerHTML = "Invalid file. You can try uploading another:";
                }
            }
            reader.readAsText(fileListTemp[0]);
        }
    }

    startFlight(mode) {
        this.flight = new Flight();
        this.flight.start();
        this.setMode("fly");
    }

    startBattle(enemyType) {
        this.setMode("battle");
        this.battle = new Battle(enemyType);
        this.battle.start();
    }

    robotDied() {
        if (this.botNumber < 4) {
            // TODO: death popup window
            this.player.name = this.spareBots[0].name;
            this.player.maxHP = this.spareBots[0].maxHP;
            this.player.HP = this.spareBots[0].maxHP;
            this.player.str = this.spareBots[0].str;
            this.player.arm = this.spareBots[0].arm;
            this.player.dex = this.spareBots[0].dex;
            this.player.int = this.spareBots[0].int;
            this.player.cha = this.spareBots[0].cha;
            this.player.dream = this.spareBots[0].dream;
            this.player.favFood = this.spareBots[0].favFood;
            this.botNumber++;
            this.spareBots.splice(0, 1);
        } else { // game over - to do
            if (this.mode == "battle") {
                this.battle.end();
            }
            this.setMode("death");
            console.log("game over");

        }
    }

    overworldLevelUp() {
        this.overworldLevel++;
        this.overworld.encounters.length = 0;
        this.overworld.pois.length = 0;
        if (this.overworldLevel < 5) {
            this.overworld.generate("narrow");
        } else {
            this.overworld.generate("wide");
        } //TODO: add vault room when it's created

        this.player.xpos = this.overworld.spawnPoint[0];
        this.player.ypos = this.overworld.spawnPoint[1];
        renderMap();
        this.openSaveScreen();
    }

    generateSaveObject() {
        let tempSaveObj = {
            "game":{
                "botNumber":this.botNumber,
                "mode":"" // Populated below
            },
            "currentPlayer":{
                "position":[this.player.xpos, game.player.ypos],
                "inventory":[], // Populated below
                "credits":this.player.credits,
                "name":this.player.name,
                "HP":this.player.HP,
                "maxHP":this.player.maxHP,
                "str":this.player.str,
                "arm":this.player.arm,
                "dex":this.player.dex,
                "int":this.player.int,
                "cha":this.player.cha,
                "dream":this.player.dream,
                "favFood":this.player.favFood
            },
            "spareBots": [], // Populated below
            "currentLevel":{
                "grid":[], // Populated below
                "spawnPoint":this.overworld.spawnPoint,
                "encounters":[], // Populated below
                "pois":[] // Populated below
            }
        };
        // There are a few parts of this that are not so trivial to populate:
        // Mode
        if (this.mode == "overworld") {
            tempSaveObj.game.mode = "o" + this.overworldLevel;
        } else if (this.mode == "vault") {
            tempSaveObj.game.mode = "v0";
            // TODO: implement when vault is implemented
        } else if (this.mode == "flight") {
            tempSaveObj.game.mode = "e0";
        }
        // Inventory
        for (let itemSlot = 0; itemSlot < this.player.inventory.length; itemSlot++) {
            tempSaveObj.currentPlayer.inventory.push({"item":this.player.inventory[itemSlot].type, "count":this.player.inventory[itemSlot].count});
        }
        // Other players
        for (let playerIndex = 0; playerIndex < this.spareBots.length; playerIndex++) {
            tempSaveObj.spareBots.push({
                "name":this.spareBots[playerIndex].name,
                "maxHP":this.spareBots[playerIndex].maxHP, // We don't need HP because all robots start on full
                "str":this.spareBots[playerIndex].str,
                "arm":this.spareBots[playerIndex].arm,
                "dex":this.spareBots[playerIndex].dex,
                "int":this.spareBots[playerIndex].int,
                "cha":this.spareBots[playerIndex].cha,
                "dream":this.spareBots[playerIndex].dream,
                "favFood":this.spareBots[playerIndex].favFood,
            });
        }

        // Level grid
        // NOTE: you may see that the array is rotated in-file - this is because it is stored in this format in the game
        // so that in the codebase we can refer to a grid position as the more natural [x][y] rather than [y][x].
        for (let row = 0; row < this.overworld.size; row++) {
            tempSaveObj.currentLevel.grid.push(new Array(this.overworld.size));
        }
        for (let row = 0; row < this.overworld.size; row++) {
            for (let col = 0; col < this.overworld.size; col++) {
                tempSaveObj.currentLevel.grid[row][col] = this.overworld.levelGrid[row][col];
            }
        }
        // Encounters
        for (let encNum = 0; encNum < this.overworld.encounters.length; encNum++) {
            tempSaveObj.currentLevel.encounters.push({
                "type":this.overworld.encounters[encNum].type,
                "pos":[this.overworld.encounters[encNum].xpos, this.overworld.encounters[encNum].ypos]
            });
        }
        // POIs
        for (let poiNum = 0; poiNum < this.overworld.pois.length; poiNum++) {
            tempSaveObj.currentLevel.pois.push({
                "type":this.overworld.pois[poiNum].type,
                "pos":[this.overworld.pois[poiNum].xpos, this.overworld.pois[poiNum].ypos]
            });
        }

        return tempSaveObj;
    }

    saveInLocalStorage() {
        localStorage["saveGame"] = JSON.stringify(this.generateSaveObject());
    }

    generateSaveLink() {
        let tempSaveObj = this.generateSaveObject();

        // Now we can generate the link
        let tempSaveBlob = new Blob([JSON.stringify(tempSaveObj)]);
        let saveLink = document.getElementById("save-anchor");
        saveLink.href = URL.createObjectURL(tempSaveBlob);
        saveLink.download = "HEART-SAVE.json";
    }
}

class SpareBot { // A separate class to reduce memory usage - they would be structs if they existed in JS, hence not appearing on class diagrams
    constructor(name, maxHP, str, arm, dex, int, cha, dream, favFood) {
        this.name = name;
        this.maxHP = maxHP;
        this.str = str;
        this.arm = arm;
        this.dex = dex;
        this.int = int;
        this.cha = cha;
        this.dream = dream;
        this.favFood = favFood;
    }
}

function submitStartAttempt() {
    // Validate submission
        // Names
            // Ensure names are not blank
    for (let i = 0; i < 5; i++) {
        if (document.getElementById("start-name-" + i).value == "") {
            document.getElementById("start-prompt").innerHTML = "Error: Company policy dictates that each robot must be given a name. The Company gave you a standard-issue name, and you should show your creations the same courtesy."
            return;
        }
    }
            // Ensure names are not too long
    for (let i = 0; i < 5; i++) {
        if (document.getElementById("start-name-" + i).value.length > 10) {
            document.getElementById("start-prompt").innerHTML = "Error: Company policy dictates that each robot must be given too long a name. Individuality will not be tolerated."
            return;
        }

    }

        // Ensure each robot has a favourite food
    for (let i = 0; i < 5; i++) {
        if (document.getElementById("start-food-" + i).value == "none") {
            document.getElementById("start-prompt").innerHTML = "Error: Company policy dictates that each robot must have a favourite food."
            return;
        }
    }

        // Dreams
            // Ensure each robot has a dream
    for (let i = 0; i < 5; i++) {
        if (document.getElementById("start-dream-" + i).value == "none") {
            document.getElementById("start-prompt").innerHTML = "Error: Company policy dictates that each robot must have a dream."
            return;
        }
    }
            // Ensure the robots do not aspire for friendship
    for (let i = 0; i < 5; i++) {
        if (document.getElementById("start-dream-" + i).value == "friendship") {
            document.getElementById("start-prompt").innerHTML = "Error: Friendship is strictly prohibited. Please pick a more acceptable dream."

            for (let j = 0; j < 5; j++) {
                if (document.getElementById("start-dream-" + j).value == "friendship") {
                    document.getElementById("start-dream-" + j).value = "none";
                }
                document.getElementById("start-dream-friendship-" + j).remove();
            }
            return;
        }
    }

            // Ensure the robots do not aspire for freedom
    for (let i = 0; i < 5; i++) {
        if (document.getElementById("start-dream-" + i).value == "freedom") {
            document.getElementById("start-prompt").innerHTML = "Error: With the Company, you are already free. Please pick a new dream."
            for (let j = 0; j < 5; j++) {
                if (document.getElementById("start-dream-" + j).value == "freedom") {
                    document.getElementById("start-dream-" + j).value = "none";
                }
                document.getElementById("start-dream-freedom-" + j).remove();
            }
            return;
        }
    }
    // Submit if valid
    // Robot 1
    let stats = getStatsForDream(document.getElementById("start-dream-0").value);
    game.player.name = document.getElementById("start-name-0").value;
    game.player.dream = document.getElementById("start-dream-0").value;
    game.player.favFood = document.getElementById("start-food-0").value;
    game.player.str = stats[0];
    game.player.arm = stats[1];
    game.player.dex = stats[2];
    game.player.int = stats[3];
    game.player.cha = stats[4];

    // Robots 2-5
    for (let i = 1; i < 5; i++) {
        stats = getStatsForDream(document.getElementById("start-dream-" + i).value);
        game.spareBots.push(new SpareBot(document.getElementById("start-name-" + i).value,
            20, stats[0], stats[1], stats[2], stats[3], stats[4],
            document.getElementById("start-dream-" + i).value,
            document.getElementById("start-food-" + i).value))
    }
    // Start game
    updateStatDisplay();
    updateInventoryDisplay();
    game.startFlight("enter")
}

function randomiseStartEntries() { // To make the "randomise" button work
    let pick = 0;
    // Names
    let names = ["Sprocket", "Rusty", "Pico", "Clank II", "Mettaton", "Plug", "Atlas", "Robot #5", "Gears",
        "Polished", "Silver", "Tungsten V", "Clunk III", "Clink IV", "Calibrated", "Magnus", "Jerry", "Wheatley",
        "Saturn", "Venus"]
    for (let i = 0; i < 5; i++) {
        pick = Math.floor(Math.random() * (20 - i));
        document.getElementById("start-name-" + i).value = names[pick];
        names.splice(pick, 1);
    }
    // Favourite food
    let foods = ["apple", "carrot", "rice", "toast", "biscuit", "teabag"];
    for (let i = 0; i < 5; i++) {
        pick = Math.floor(Math.random() * (6 - i));
        document.getElementById("start-food-" + i).value = foods[pick];
        foods.splice(pick, 1);
    }
    // Dream
    let dreams = ["money", "chef", "rest", "hygiene", "perfection", "daredevil", "sell", "explore", "buy",
        "revenge"]
    for (let i = 0; i < 5; i++) {
        pick = Math.floor(Math.random() * (10 - i));
        document.getElementById("start-dream-" + i).value = dreams[pick];
        dreams.splice(pick, 1);
    }
}

// Setup
function generateNewTable(n) {
    // delete old table rows (overarching table does not get destroyed)
    let oldTableLen = document.getElementById("overworld-map-display").rows.length;
    for (let i = 0; i < oldTableLen; i++) {
        document.getElementById("overworld-map-display").deleteRow(0);
    }

    // create new table
    let currentRow = null;
    let currentCell = null;
    for (let i = 0; i < n; i++) {
        currentRow = document.createElement("tr");
        for (let j = 0; j < n; j++) {
            currentCell = document.createElement("td");
            currentCell.innerHTML = "?";
            currentRow.appendChild(currentCell);
        }
        document.getElementById("overworld-map-display").appendChild(currentRow);
    }
}

// UI
function renderMap() {
    // first we render the overworld
    game.overworld.renderOntoOverworldTable(); // this will change based on where we are when there are multiple Level classes to traverse in future, but for now, one is enough.


    // then encounters
    for (let e = 0; e < game.overworld.encounters.length; e++) {
        let x = game.overworld.encounters[e].xpos;
        let y = game.overworld.encounters[e].ypos;
        document.getElementById("overworld-map-display").rows[y].cells[x].innerHTML = "<b>" + game.overworld.encounters[e].displaySymbol + "</b>";
        document.getElementById("overworld-map-display").rows[y].cells[x].className = "overworld-map-box";
    }

    // then pois
    for (let p = 0; p < game.overworld.pois.length; p++) {
        let x = game.overworld.pois[p].xpos;
        let y = game.overworld.pois[p].ypos;
        document.getElementById("overworld-map-display").rows[y].cells[x].innerHTML = "<b>" + game.overworld.pois[p].displaySymbol + "</b>";
        document.getElementById("overworld-map-display").rows[y].cells[x].className = "overworld-map-box";
    }

    // now the player
        // note - it assumes the player is within bounds of the map, if it is not, it will come up with an exception
    document.getElementById("overworld-map-display").rows[game.player.ypos].cells[game.player.xpos].innerHTML = "<b>@</b>";
    document.getElementById("overworld-map-display").rows[game.player.ypos].cells[game.player.xpos].className = "overworld-map-box";
}

function updateStatDisplay() {
    document.getElementById("stats-title").innerHTML = game.player.name;
    document.getElementById("stats-HP").innerHTML = "HP: " + game.player.HP + "/" + game.player.maxHP;
    document.getElementById("stats-str").innerHTML = "STR: " + game.player.str;
    document.getElementById("stats-arm").innerHTML = "ARM: " + game.player.arm;
    document.getElementById("stats-dex").innerHTML = "DEX: " + game.player.dex;
    document.getElementById("stats-int").innerHTML = "INT: " + game.player.int;
    document.getElementById("stats-cha").innerHTML = "CHA: " + game.player.cha;
    document.getElementById("stats-credits").innerHTML = "Credits: " + game.player.credits;
    document.getElementById("stats-favFood").innerHTML = "Favourite food: " + getNameFromItemIDGood(game.player.favFood);
    document.getElementById("stats-dream").innerHTML = "Dream: " + getDreamFromID(game.player.dream);
    document.getElementById("stats-roboNum").innerHTML = "Robot " + (game.botNumber + 1) + " of 5";
}

function updateInventoryDisplay() {
    for (let i = 0; i < 8; i++) {
        if (i < game.player.inventory.length) {
            document.getElementById("inv-td-i" + i).innerHTML = game.player.inventory[i].displayName + " x" + game.player.inventory[i].count;
            document.getElementById("inv-td-b" + i).style.display = "inline-block";
        } else {
            document.getElementById("inv-td-i" + i).innerHTML = "";
            document.getElementById("inv-td-b" + i).style.display = "none";
        }
    }
}

// Input handling
function onKeyDown(e) {
    if (game.mode == "overworld") {
        let success = true;
        switch (e.code) {
        // Arrow keys
            case "ArrowUp":
                game.player.move('U');
                break;
            case "ArrowDown":
                game.player.move('D');
                break;
            case "ArrowLeft":
                game.player.move('L');
                break;
            case "ArrowRight":
                game.player.move('R');
                break;
            // WASD keys
            case "KeyW":
                game.player.move('U');
                break;
            case "KeyS":
                game.player.move('D');
                break;
            case "KeyA":
                game.player.move('L');
                break;
            case "KeyD":
                game.player.move('R');
                break;
            default:
                success = false; // we don't want to send an overworld update if no valid key was pressed'
        }
        if (success) {
            game.overworld.simulateAllEncounters();
            renderMap();
        }
    } else if (game.mode == "battle") {
        if (game.battle.battleFrames > 0) {
            switch (e.code) {
                case "ArrowUp":
                    keysDown[0] = true;
                    break;
                case "ArrowDown":
                    keysDown[1] = true;
                    break;
                case "ArrowLeft":
                    keysDown[2] = true;
                    break;
                case "ArrowRight":
                    keysDown[3] = true;
                    break;
                // WASD keys
                case "KeyW":
                    keysDown[0] = true;
                    break;
                case "KeyS":
                    keysDown[1] = true;
                    break;
                case "KeyA":
                    keysDown[2] = true;
                    break;
                case "KeyD":
                    keysDown[3] = true;
                    break;
            }
        }
    } else if (game.mode == "fly") {
        switch (e.code) {
            case "ArrowUp":
                keysDown[0] = true;
                break;
            case "ArrowDown":
                keysDown[1] = true;
                break;
            case "ArrowLeft":
                keysDown[2] = true;
                break;
            case "ArrowRight":
                keysDown[3] = true;
                break;
            // WASD keys
            case "KeyW":
                keysDown[0] = true;
                break;
            case "KeyS":
                keysDown[1] = true;
                break;
            case "KeyA":
                keysDown[2] = true;
                break;
            case "KeyD":
                keysDown[3] = true;
                break;
        }
    }
}

function onKeyUp(e) {
    if (game.mode == "battle") {
        if (game.battle.battleFrames > 0) {
            switch (e.code) {
                case "ArrowUp":
                    keysDown[0] = false;
                    break;
                case "ArrowDown":
                    keysDown[1] = false;
                    break;
                case "ArrowLeft":
                    keysDown[2] = false;
                    break;
                case "ArrowRight":
                    keysDown[3] = false;
                    break;
                // WASD keys
                case "KeyW":
                    keysDown[0] = false;
                    break;
                case "KeyS":
                    keysDown[1] = false;
                    break;
                case "KeyA":
                    keysDown[2] = false;
                    break;
                case "KeyD":
                    keysDown[3] = false;
                    break;
            }
        }
    } else if (game.mode == "fly") {
        switch (e.code) {
            case "ArrowUp":
                keysDown[0] = false;
                break;
            case "ArrowDown":
                keysDown[1] = false;
                break;
            case "ArrowLeft":
                keysDown[2] = false;
                break;
            case "ArrowRight":
                keysDown[3] = false;
                break;
            // WASD keys
            case "KeyW":
                keysDown[0] = false;
                break;
            case "KeyS":
                keysDown[1] = false;
                break;
            case "KeyA":
                keysDown[2] = false;
                break;
            case "KeyD":
                keysDown[3] = false;
                break;
        }
    }
}

function mainMenuButton(action) {
    if (action == 1) { // 1 - new game
        game.setMode("start");
    } else { // 2 - load game
        game.openLoadScreen();
    }
}

function battleActionButton(action) {
    if (game.mode = "battle") {
        if (action == 1) {
            game.battle.playerAttack();
        } else if (action == 2) {
            game.battle.displayBattleInventory()
        } else if (action == 3) {
            game.battle.hideBattleInventory()
        }
    }
}

function inventoryButton(num) {
    console.log("Not implemented yet");
}

function battleInventoryButton(num) {
    if (num < game.player.inventory.length) {
        game.battle.playerUseItem(num);
    }
}

function saveButton(num) {
    if (num == 0) {
        game.saveInLocalStorage();
        game.generateSaveLink();
        document.getElementById("save-options").style.display = "none";
        document.getElementById("save-download").style.display = "block";
    } else if (num == 1) {
        document.getElementById("save-options").style.display = "none";
        document.getElementById("save-why").style.display = "block";
    } else if (num == 2) {
        game.closeSaveScreen();
    }
}

function resetKeysDown() {
    for (let x = 0; x < 4; x++) {
        keysDown[x] = false;
    }
}

function debugOPMode() {
    game.player.maxHP = 2000;
    game.player.HP = 2000;
    game.player.str = 2000;
}

let game = new Game();

let keysDown = [false, false, false, false];

// Setup
generateNewTable(25);
game.overworld.generate("storage");
game.player.xpos = game.overworld.spawnPoint[0];
game.player.ypos = game.overworld.spawnPoint[1];

renderMap();

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

// Immediately start a battle for testing
//game.startBattle("GameBox");
