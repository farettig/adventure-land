

//Custom Settings
//Farming spots are found in G.maps.main

//const farmMonsterName = "bee";
//const farmMap = "main";
//const farmMonsterNr = 4;

// const farmMonsterName = "crabx";
// const farmMap = "main";
// const farmMonsterNr = 5;
// const singleTarget = false;

// //  boars
// const stationary = false;
// const singleTarget = true;
// const farmMonsterName = "boar";
// const farmMap = "winterland";
// const farmMonsterNr = 8;



// // Hawks
// const stationary = false;
// const singleTarget = true;
// const farmMonsterName = "bigbird";
// const farmMap = "main";
// const farmMonsterNr = 5;


// Wolf
const stationary = false;
const singleTarget = true;
const farmMonsterName = "wolf";
const farmMap = "winterland";
const farmMonsterNr = 7;
const extraAggroLimit = 2;


// // ent
// const stationary = false;
// const singleTarget = true;
// const farmMonsterName = "ent";
// const farmMap = "desertland";
// const farmMonsterNr = 3;
// // const Spadar = false;


// const stationary = false;
// const singleTarget = true;
// const farmMonsterName = "gredpro";
// const farmMap = "mansion_u";
// const farmMonsterNr = 1;

// //  crocs
// const stationary = false;
// const singleTarget = false;
// const farmMonsterName = "croc";
// const farmMap = "main";
// const farmMonsterNr = 6;



// const stationary = true;
// const singleTarget = false;
// const farmMonsterName = "rat";
// const farmMap = "mansion";
// const farmMonsterNr = 5;

const specialMonsters = ["snowman","goldenbat","stompy","ent"]; 


//  Defining Characters
const rogueName = "Matiiiiiin"
const merchantName = "Matiiiiin";
const priestName = "Matiiiin";
const rangerName = "Matiin";
const mageName = "Matiiin";
const warriorName = "Matin";
const partyList = [priestName, rogueName, warriorName,merchantName]; //merchantName  merchantName
const whiteList = ["Matin","Matiin","Matiiin","Matiiiin","Matiiiiin","Matiiiiiin"];
const Spadar = false;

//  class of your main tank
const mainTank = {name: warriorName, class: "warrior"};
const mainLooter = {name: priestName, class: "priest"};

//  potion stuff
const mPot = "mpot1"
const hPot = "hpot1"
const mPotionThreshold = 2000;
const hPotionThreshold = 500;
// const healthPotThreshold = 0.95
// const manaPotThreshold = 0.85;
const potionMax = 5000;

//  inventory management
const reserveMoney = 50000000;
const reserveMoneyCombat = 5000000;
const minNormalCompoundScrolls = 10;
const minRareCompoundScrolls = 3;
const minNormalUpgradeScrolls = 200;
const minRareUpgradeScrolls = 5;
const inventoryMax = 31;
const merchantStandMap = "main";
const merchantStandCoords = {x:-127, y:-124};
const itemsToKeep = [mPot, hPot, "tracker","handofmidas","goldbooster"];
const equipmentToKeep = ["sshield","fireblade","shield","pants","helmet","gloves","wingedboots","wshoes","handofmidas","wcap","wbreeches"];


const trashName = ["hpbelt","hpring","hpearring","hpamulet","vitearring","vitring","ringsj",
                    "wattire","wgloves","wbreeches","wshoes","wcap","stinger","intamulet","stramulet","dexamulet",
                    "intearring","strearring","dexearring"];




//  Upgrade stuff
const baseChance = [100.00,   98.00,   95.00,   71.26,   61.42,   41.38,   26.35,   15.51,   7.55,   3.25,   28.00,   22.00,];

const upgradeItemLevel1 = 5;
const upgradeItemLevel2 = 7;
const sellItemLevel = 3;
const mluckDuration = 3600000;

const upgradeItemList = ["bow","staff","helmet","shoes","gloves","pants","coat","quiver","wbasher","xmashat",
                        "eslippers","eears", "epyjamas","helmet1","coat1","gloves1","pants1","t2bow","carrotsword","merry","cclaw",
                        "wingedboots","cclaw","xmassweater","wattire","wgloves","wbreeches","wshoes","wcap"];
const combineItemList = ["intring","strring","dexring"];
const vendorUpgradeList = ["shoes","gloves","helmet","coat","wbasher"]; 	
const specialItems = ["firestaff","firesword","seashell","offering","essenceofire","leather"];
const buyFromPonty = ["intring","strring","dexring",,"intbelt","strbelt","dexbelt","wbook0",
                        "helmet1","coat1","gloves1","pants1","hhelmet","harmor","hpants","hgloves","rattail","sshield","spores",
                        "cclaw","xmassweater","mshield","oozingterror","harbringer","eggnog","crabclaw","poison","spidersilk","beewings"];

// let merchantStatus = {idle: true, hasBeenTeleported: false};
// let mluckRecently = false;
// let hpRecently = false;
// let mpRecently = false;
// let requestFulfilled = false;
// let requestedSomething = false;

const craftingEnabled = true;
var craftingOn = craftingEnabled;
var banking = false;
var farmingModeActive = true;
var returningToTown = false;
var traveling = false;
let sentRequests = [];

load_code(2);   //helperFunctions
load_code(3);   //mageSkills
load_code(4);   //merchantSkills
load_code(5);   //priestSkills
load_code(6);   //rangerSkills
load_code(8);   //evadeTarget
load_code(9);   //warriorSkills
load_code(11);  //logging
if (character.ctype == mainTank.class) load_code(12);  //GUI
load_code(13);  //rogueSkills




//Hotkeys!
map_key("5", "snippet", "loadCharacters()")
map_key("6", "snippet", "initParty()")
map_key("7", "snippet", "stopCharacters()")


//  called on initialization
onStart();
function onStart()
{
    if (character.name == merchantName)
    {
        merchantOnStart();
    }
    let data = "Client Started"
    writeToLog(data);
    respawnProcess();
}



setInterval(main, 100); // Loops every 1/10 seconds
setInterval(tier2Actions, 3000); // Loops every 3 seconds.
setInterval(respawnProcess, 15000);
setInterval(tier3Actions, 7500);

function main(){

    //If Character is dead, respawn
    if (character.rip) setTimeout(respawn, 15000);  

    //  finish what you are doing before checking past here
    if ( smart.moving || returningToTown )     return;
    // if (is_moving(character) || smart.moving || returningToTown )     return;

     
    if (character.name == merchantName)     standCheck();

    //Replenish Health and Mana
    usePotions();
    //Loot everything
    if (!Spadar)
    {
        if (character.ctype == mainLooter.class)
        {
            // loot();
            lootRoutine();
        }
        
    }
    
    
    //Merchant Skills are Tier 2 actions
    if(character.ctype === "merchant") return;

   doCombat();
}

function tier2Actions(){
        
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

function respawnProcess()
{
    if(character.ctype === "merchant") return;
   
    if ( parent.party_list.length < partyList.length)
    {
        for (let p of partyList)
	    {
            if ( !parent.party_list.includes(p) )
            {
                if ( (p !== character.name) && (p !== merchantName) && ( character.name == mainTank.name) )  
                {
                    loadCharacter(p);
                    log(p+"loading");   
                }
                
                setTimeout(send_party_invite, 3000, p );                
            }
        }
	}
} 
    

// character.on("level_up",function(data){
// 	writeToLog("New Level "+data.level);
// });

// character.on("target_hit",function(data){
//     let targetHit = get_entity(data.target); 
//     if (data.source !== "undefined")
//     {
//         writeToLog(
//             "target="+targetHit.name+" damage="+data.damage+" source="+data.source
//         );
//     }

// });