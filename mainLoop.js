load_code(2);   //helperFunctions
load_code(3);   //mageSkills
load_code(4);   //merchantSkills
load_code(5);   //priestSkills
load_code(6);   //rangerSkills
load_code(8);   //evadeTarget

//Hotkeys!
map_key("5", "snippet", "loadCharacters()")
map_key("6", "snippet", "initParty()")
map_key("7", "snippet", "stopCharacters()")

//Custom Settings
//Farming spots are found in G.maps.main
//const farmMonsterName = "bee";
//const farmMap = "main";
//const farmMonsterNr = 4;

const farmMonsterName = "crabx";
const farmMap = "main";
const farmMonsterNr = 5;
const specialMonsters = ["phoenix","snowman","goldenbat"];
const singleTarget = false;
// const farmMonsterName = "boar";
// const farmMap = "winterland";
// const farmMonsterNr = 8;
// const specialMonsters = ["phoenix","snowman"];
// const singleTarget = true;


//  Defining Characters
const merchantName = "Matiiiiin";
const priestName = "Matiiiin";
const rangerName = "Matiin";
const mageName = "Matiiin";
const warriorName = "Matin";
const partyList = [merchantName, priestName, rangerName, mageName];
const whiteList = ["Matin","Matiin","Matiiin","Matiiiin","Matiiiiin"];

//  class of your main tank
const mainTank = {name: priestName, class: "priest"};


//  potion stuff
const mPot = "mpot1"
const hPot = "hpot1"
const mPotionThreshold = 2000;
const hPotionThreshold = 500;
const healthPotThreshold = 0.95
const manaPotThreshold = 0.85;
const potionMax = 5000;

//  inventory management
const reserveMoney = 10000000;
const minNormalCompoundScrolls = 10;
const minRareCompoundScrolls = 3;
const minNormalUpgradeScrolls = 200;
const minRareUpgradeScrolls = 5;
const inventoryMax = 31;
const merchantStandMap = "main";
const merchantStandCoords = {x:-100, y:-50};
const itemsToKeep = [mPot, hPot, "tracker"];

const trashName = ["hpbelt","hpring","hpearring","hpamulet","vitscroll","vitearring","vitring","ringsj",
                    "cclaw"];




//  Upgrade stuff
const baseChance = [100.00,   98.00,   95.00,   71.26,   61.42,   41.38,   26.35,   15.51,   7.55,   3.25,   28.00,   22.00,];

const upgradeItemLevel1 = 5;
const upgradeItemLevel2 = 7;
const sellItemLevel = 3;
const profitMargin = 1.8;
const manaReserve = 0.2;
const mluckDuration = 3600000;

const upgradeItemList = ["wattire","wgloves","wbreeches","wshoes","wcap","bow","staff","pants1",
                        "helmet","shoes","gloves","pants","coat","quiver","wbasher","xmashat"];
const combineItemList = ["intring","strring","dexring","vitring"];
const vendorUpgradeList = ["shoes","gloves","helmet","coat","wbasher"]; 	
const specialItems = ["firestaff","firesword","seashell","offering","essenceofire","leather"];

let merchantStatus = {idle: true, hasBeenTeleported: false};
let mluckRecently = false;
let hpRecently = false;
let mpRecently = false;
let requestFulfilled = false;
let requestedSomething = false;

const craftingEnabled = true;
var craftingOn = craftingEnabled;
var banking = false;
var farmingModeActive = true;
var returningToTown = false;
var traveling = false;
let sentRequests = [];

//  called on initialization
onStart();
function onStart()
{
    if (character.name == merchantName)
    {
        merchantOnStart();
    }
}



setInterval(main, 1000 / 4); // Loops every 1/4 seconds.
setInterval(tier2Actions, 3000); // Loops every 3 seconds.
setInterval(respawnProcess, 15000)
setInterval(tier3Actions, 7500);

function main(){

    //If Character is dead, respawn
    if (character.rip) setTimeout(respawn, 15000);  

    //  finish what you are doing before checking past here
    if (is_moving(character) || smart.moving || returningToTown || character.q.upgrade || character.q.compound)     return;
     
    if (character.name == merchantName)     standCheck();

    //Replenish Health and Mana
    usePotions();
    //Loot everything
    loot();
    
    //Merchant Skills are Tier 2 actions
    if(character.ctype === "merchant") return;

   doCombat();
}

function tier2Actions(){
        
    //Puts potions on Slots not transferred to merchant
    relocateItems();
    //Transfer loot to merchant
    transferLoot(merchantName);
    checkPotionInventory();
    checkBuffs();

    
    //Run Merchant Skills
    if(character.ctype === "merchant"){
        if(is_moving(character) || smart.moving){
            parent.close_merchant(41);
        }
        merchantSkills();
        merchantAuto();
        return;
    }
}

function tier3Actions(){
    checkSentRequests();
    checkRequests();
}

function respawnProcess(){
    if(character.ctype === "merchant") return;
   
    if (parent.party_list.length < 3){
        setTimeout(loadCharacters());
        setTimeout(initParty(), 4000);
    }

}    
