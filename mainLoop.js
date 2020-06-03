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
const farmMonsterName = "croc";
const farmMap = "main";
const farmMonsterNr = 6;
const specialMonsters = ["phoenix","snowman"];


//  Defining Characters
const merchantName = "Matiiiiin";
const priestName = "Matiiiin";
const rangerName = "Matiin";
const mageName = "Matiiin";
const warriorName = "Matin";
const partyList = [merchantName, priestName, rangerName, mageName];
const whiteList = ["Matin","Matiin","Matiiin","Matiiiin","Matiiiiin"];

//  potion stuff
const mPot = "mpot0"
const hPot = "hpot0"
const mPotionThreshold = 200;
const hPotionThreshold = 50;
const healthPotThreshold = 0.95
const manaPotThreshold = 0.85;

//  inventory management
const reserveMoney = 1000000;
const minNormalCompoundScrolls = 10;
const minRareCompoundScrolls = 3;
const minNormalUpgradeScrolls = 200;
const minRareUpgradeScrolls = 5;
const inventoryMax = 31;

const trashName = ["hpbelt","hpring","hpearring","hpamulet","vitscroll","vitearring","ringsj"];


const upgradeItemLevel1 = 5;
const upgradeItemLevel2 = 7;
const sellItemLevel = 3;
const profitMargin = 1.8;
const manaReserve = 0.2;
const mluckDuration = 3600000;

const enchantItemList = ["wattire","wgloves","wbreeches","wshoes","wcap","bow","staff","pants1","helmet","shoes","gloves","pants","coat"];
const combineItemList = ["intring","strring","dexring","vitring"];
const vendorUpgradeList = ["shoes","gloves","helmet","coat"]; 	
const specialItems = ["firestaff","firesword","seashell","offering"];

let merchantStatus = {idle: true};
let mluckRecently = false;
let mluckRequestRecently = false;
let hpRequestRecently = false;
let mpRequestRecently = false
let hpRecently = false;
let mpRecently = false;
let requestFulfilled = false;

setInterval(main, 1000 / 4); // Loops every 1/4 seconds.
setInterval(tier2Actions, 3000); // Loops every 3 seconds.
setInterval(respawnProcess, 15000)

function main(){

    //If Character is dead, respawn
    if (character.rip) setTimeout(respawn, 15000);  
    //If character is moving, do nothing
    if(is_moving(character) || smart.moving){
        if(character.ctype === "merchant"){
            parent.close_merchant(41);
        }
        return;
    }
    //Replenish Health and Mana
    usePotions(healthPotThreshold, manaPotThreshold);
    //Loot everything
    loot();
    
    //Merchant Skills are Tier 2 actions
    if(character.ctype === "merchant") return;

    //Finds a suitable target and attacks it. Also returns the target!
    let target = null;

    //  look for any special targets
    for(let i = 0; i < specialMonsters.length; i++){
        target = getTarget(specialMonsters[i]);
    }

    //  look for the monster you are farming
    if(!target)
    {
        target = getTarget(farmMonsterName);
    }

    if(target){
        //Kites Target
        //kiteTarget(target);
        //Circles Target
        //circleTarget(target);
        //Uses available skills
        if(character.ctype === "mage") mageSkills(target);
        if(character.ctype === "priest") priestSkills(target);
        if(character.ctype === "ranger") rangerSkills(target, farmMonsterName);
        //Attacks the target
        autoFight(target);
    }else{
        //Go to Farming Area
        getFarmingSpot(farmMonsterName, farmMap, farmMonsterNr, "move");
    }
}

function tier2Actions(){
    
    //If character is moving, do nothing
    if(is_moving(character) || smart.moving){
        if(character.ctype === "merchant"){
            parent.close_merchant(41);
        }
        return;
    }
    
    //Puts potions on Slots not transferred to merchant
    relocateItems();
    //Transfer loot to merchant
    transferLoot(merchantName);
    potionCheck();
    mLuckCheck();
    
    //Run Merchant Skills
    if(character.ctype === "merchant"){
        if(is_moving(character) || smart.moving){
            parent.close_merchant(41);
        }
        merchantSkills();
        return;
    }
}

function respawnProcess(){
    if(character.ctype === "merchant") return;
   
    if (parent.party_list.length < 2){
        setTimeout(loadCharacters());
        setTimeout(initParty(), 8000);
    }

}    
