function getStatsForDream(dream) {
    if (dream == "chef") { // if JS had enums this would be much easier
        return [4, 6, 5, 6, 4];
    } else if (dream == "rest") {
        return [6, 6, 3, 5, 5];
    } else if (dream == "hygiene") {
        return [4, 4, 4, 8, 5];
    } else if (dream == "daredevil") {
        return [4, 7, 5, 4, 5];
    } else if (dream == "sell") {
        return [4, 4, 4, 6, 7];
    } else if (dream == "explore") {
        return [4, 4, 6, 7, 4];
    } else if (dream == "revenge") {
        return [6, 6, 6, 4, 3];
    } else { // dreams "money", "perfection", "buy" and any invalid values get the default of all stats being 5
        return [5, 5, 5, 5, 5];
    }
}

function getNameFromItemIDGood(id) { // The pleasant name rather than the off-putting display names in inventory
    if (id == "apple") {
        return "Apples"
    } else if (id == "carrot") {
        return "Carrots"
    } else if (id == "rice") {
        return "Rice"
    } else if (id == "toast") {
        return "Toast"
    } else if (id == "biscuit") {
        return "Biscuits"
    } else if (id == "teabag") {
        return "Teabags"
    } else  {
        return "Unknown"
    }
}

function getDreamFromID(id) { // The pleasant name rather than the off-putting display names in inventory
    if (id == "money") {
        return "Wealth"
    } else if (id == "chef") {
        return "Cooking"
    } else if (id == "rest") {
        return "Sleep"
    } else if (id == "hygiene") {
        return "Hyiene"
    } else if (id == "perfection") {
        return "Perfection"
    } else if (id == "daredevil") {
        return "Thrill"
    } else if (id == "sell") {
        return "Business"
    } else if (id == "explore") {
        return "Exploration"
    } else if (id == "buy") {
        return "Shopping"
    } else if (id == "revenge") {
        return "Revenge"
    }
}

// Arrays of IDs
let items = ["apple","carrot", "rice", "raisins", "toast", "soap", "biscuit", "teabag"];
// Note: Freedom and friendship are not included below due to being invalid dreams
let dreams = ["friendship", "money", "chef", "rest", "hygiene", "perfection", "daredevil", "sell",
    "explore", "buy", "revenge"];
let enemies = ["Calculator", "Floppy Disk", "GameBox", "Optical Disk", "Keyboard"];
let pois = ["exit", "grill", "cactus", "vendingMachine"];