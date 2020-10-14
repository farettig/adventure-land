




// // Wolf
// const stationary = false;
// const singleTarget = true;
// const farmMonsterName = "wolf";
// const farmMap = "winterland";
// const farmMonsterNr = 7;
// const extraAggroLimit = 2;
// const specialCoords = {x:422, y:-2423};

// xscorp
const stationary = false;
const singleTarget = true;
const farmMonsterName = "xscorpion";
const farmMap = "halloween";
const farmMonsterNr = 6;
const extraAggroLimit = 2;
const specialCoords = {x:-253, y:731};


// // bscorpion
// const stationary = false;
// const singleTarget = true;
// const farmMonsterName = "bscorpion";
// const farmMap = "desertland";
// const farmMonsterNr = 1;
// const extraAggroLimit = 0;
// const specialCoords = {x:-550,y:-1300};



// // // plantoid
// const stationary = false;
// const singleTarget = true;
// const farmMonsterName = "plantoid";
// const farmMap = "desertland";
// const farmMonsterNr = 4;
// const extraAggroLimit = 0;
// const specialCoords = {x:-800,y:-400};

// //squigs, frogs, other stuff
// const specialCoords = {x:-1140,y:800};
// const farmMap = "main";
// const stationary = false;
// const singleTarget = false;
// const extraAggroLimit = 3;
// const farmMonsterName = "squig";
// const farmMonsterNr = 0;




const specialMonsters = ["snowman","goldenbat","stompy","fvampire","frog","squigtoad","tortoise","squig","mrpumpkin"]; //"phoenix"


//  Defining Characters
const rogueName = "Matiiiiiin"
const merchantName = "Matiiiiin";
const priestName = "Matiiiin";
const rangerName = "Matiin";
const mageName = "Matiiin";
const warriorName = "Matin";
const partyList = [warriorName, rogueName, priestName, merchantName]; //merchantName  merchantName
const whiteList = ["Matin","Matiin","Matiiin","Matiiiin","Matiiiiin","Matiiiiiin"];
const Spadar = false;
const externalParty = [];
const burnCap = 1800;

//  class of your main tank
const mainTank = {name: warriorName, class: "warrior"};
const offTank = {name: priestName, class: "priest"};
const mainLooter = {name: priestName, class: "priest"};
const soloMode = false;
const seperateMode = false;


//  potion stuff
const mPot = "mpot1"
const hPot = "hpot1"
const mPotionThreshold = 2000;
const hPotionThreshold = 500;
// const healthPotThreshold = 0.95
// const manaPotThreshold = 0.85;
const potionMax = 5000;

//  inventory management
const reserveMoney = 150000000;
const reserveMoneyCombat = 5000000;
const minNormalCompoundScrolls = 10;
const minRareCompoundScrolls = 3;
const minNormalUpgradeScrolls = 200;
const minRareUpgradeScrolls = 5;
const inventoryMax = 31;
const merchantStandMap = "main";
const merchantStandCoords = {x:-127, y:-124};
const itemsToKeep = [mPot, hPot, "tracker","handofmidas","goldbooster","lantern","luckbooster","xpbooster","elixirluck","pumpkinspice","computer","scroll0","scroll1","cscroll0","cscroll1"];
const equipmentToKeep = ["wgloves","test_orb","sshield","fireblade","shield","pants","helmet","gloves","wingedboots","wshoes","handofmidas","wcap","wbreeches","bataxe","basher","mittens"];


const trashName = ["hpbelt","hpring","hpearring","hpamulet","vitearring","vitring","ringsj",
                    "wattire","wgloves","wbreeches","wshoes","wcap","stinger","stramulet","cclaw","quiver","slimestaff",
                    "wbook0","phelmet"];


//  Upgrade stuff
const baseChance = [100.00,   98.00,   95.00,   71.26,   61.42,   41.38,   26.35,   15.51,   7.55,   3.25,   28.00,   22.00,];

const upgradeItemLevel1 = 5;
const upgradeItemLevel2 = 7;
const sellItemLevel = 3;
const mluckDuration = 3600000;

const upgradeItemList = ["bow","staff","helmet","shoes","gloves","pants","coat","xmashat",
                        "eslippers","eears", "epyjamas","t2bow","carrotsword","merry","cclaw",
                        "wingedboots","cclaw","xmassweater","pmace","coat1","gloves1","pants1","helmet1","cape"]; 

const combineItemList = ["intring","strring","dexring","intearring","strearring","dexearring","intamulet","dexamulet"];
const vendorUpgradeList = ["gloves","helmet","coat"]; 	
const specialItems = ["glitch","firestaff","firesword","seashell","offering","essenceofire","leather","fury","vitscroll","lspores","gem0","seashell"];
const buyFromPonty = ["glitch","intring","strring","dexring",,"intbelt","strbelt","dexbelt",
                        "coat1","gloves1","pants1","helmet1","hhelmet","harmor","hpants","hgloves","rattail","spores",
                        "xmassweater","mshield","oozingterror","harbringer","eggnog","crabclaw","poison","spidersilk","beewings","fury","suckerpunch",
                        "intearring","strearring","dexearring","essenceoflife","whitegg","rattail","seashell","dstones","hammer","offeringp"];

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
if(character.ctype == "mage") load_code(3);   //mageSkills
load_code(4);   //merchantSkills
if(character.ctype == "priest") load_code(5);   //priestSkills
if(character.ctype == "ranger") load_code(6);   //rangerSkills
if(character.ctype == "warrior") load_code(9);   //warriorSkills
load_code(11);  //logging
if (character.ctype == mainTank.class) load_code(12);  //GUI
if(character.ctype == "rogue") load_code(13);  //rogueSkills
load_code(15);   //pattack



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
    let data = "type=Client_Started"
    writeToLog(data);
    respawnProcess();
}



setInterval(main, 100); // Loops every 1/10 seconds
setInterval(tier2Actions, 1000); // Loops every 1 second.
setInterval(respawnProcess, 15000);
setInterval(tier3Actions, 7500);

function main(){


    //If Character is dead, respawn

    if (character.ctype == "merchant") dropAggro();
    usePotions();
    //Loot everything
    if (!Spadar)
    {
        if(soloMode)
            loot();
        else if (character.ctype == mainLooter.class)
            lootRoutine();        
    }

    if ( smart.moving || returningToTown )     return;
    if (character.name == merchantName)     standCheck();
   
    //Merchant Skills are Tier 2 actions
    if(character.ctype === "merchant") 
    {
        merchantAuto();
        return;
    }

   doCombat();
}

function tier2Actions(){
    //Transfer loot to merchant
    transferLoot(merchantName);

    //Run Merchant Skills
    if(character.ctype === "merchant")
    {
        if(is_moving(character) || smart.moving){
            parent.close_merchant(41);
        }
        merchantSkills();
        return;
    }
    characterStore();

}

function tier3Actions()
{
    if (character.rip) setTimeout(respawn, 15000);  
    checkPotionInventory();
    checkBuffs();
    checkSentRequests();
    sellTrash();
    upgradeStuff();

}

function respawnProcess()
{
    if(soloMode==true) return;

    if(character.ctype === "merchant") return;
   
    if ( parent.party_list.length < partyList.length)
    {
        for (let p of partyList)
	    {
            if ( !parent.party_list.includes(p) )
            {
                if ( (p !== character.name) && (p !== merchantName) && ( character.name == mainTank.name) && seperateMode == false )  
                {
                    loadCharacter(p);
                    log(p+"loading");   
                }
                
                setTimeout(send_party_invite, 3000, p );                
            }
        }
    }
    
    if(character.name == mainTank.name && externalParty.length > 0)
    {
        for (let person of externalParty)
        {
            if ( !parent.party_list.includes(person))
            {
                send_party_invite(person);  
            }
        }
    }
} 
    

