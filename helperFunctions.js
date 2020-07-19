

// load all dudes
function loadCharacters(){
	//start_character(warriorName, "mainLoop");
	start_character(priestName, "mainLoop");
	start_character(rangerName, "mainLoop");
	log("Loading Characters...");
	setTimeout(initParty, 8000);
}

// load a single dude
function loadCharacter(name){
	start_character(name, "mainLoop");
}


function initParty(){
	send_party_invite(priestName);
	send_party_invite(warriorName);
	send_party_invite(rangerName);
	send_party_invite(merchantName);
	send_party_invite(mageName);


	log("Party Invites sent!");
}

function stopCharacters(){
	stop_character("Matin");
	stop_character("Matiin");
	stop_character("Matiiin");
	stop_character("Matiiiin");
	stop_character("Matiiiiin");
	log("Characters stopped!");
}

function getFarmingSpot(farmMonsterName = "crab", farmMap = "main", farmMonsterNr = 8, action){
	for (map in G.maps){
		for(monster in G.maps[map].monsters){
			let currentMonster = G.maps[map].monsters[monster]
			if(map === farmMap
				&& currentMonster.type === farmMonsterName
			   	&& currentMonster.count === farmMonsterNr){
				if(action === "move"){
					//Switch Map if needed
					if(character.map != map){
						smart_move({to:map});
					//If Map correct, go to Monster
					}else{
						smart_move({x:currentMonster.boundary[0] + ((currentMonster.boundary[2] - currentMonster.boundary[0]) / 2),y:currentMonster.boundary[1] + ((currentMonster.boundary[3] - currentMonster.boundary[1]) / 2)});
					}
				}else if(action === "coord"){
					return {x:currentMonster.boundary[0] + ((currentMonster.boundary[2] - currentMonster.boundary[0]) / 2),y:currentMonster.boundary[1] + ((currentMonster.boundary[3] - currentMonster.boundary[1]) / 2)}
				}
			}
		}
	}
}

function transferLoot(merchantName){
    let merchant = get_player(merchantName);
    if(character.ctype === "merchant") return;
    if(character.ctype !== "merchant"
       && merchant
       //&& merchant.owner === character.owner
       && distance(character, merchant) < 400){
        //Transfer Gold
		if(character.gold > reserveMoneyCombat)
		{
			send_gold(merchant, character.gold - reserveMoneyCombat)
		}
        //Transfer Items
        if(character.items.filter(element => element).length > 4){
            for(let i = 0; i <= 41; i++){
				if(character.items[i] && (!itemsToKeep.includes(character.items[i].name)))
				{
					if ( equipmentToKeep.includes(character.items[i].name) && (character.items[i].level > 2) ) 
					{
						return;
					}
					else
					{
						send_item(merchantName, i, 9999);
						log(character.name + " sent items to merchant.");
					}
				}
            }
        }
    }   
}

function relocateItems()
{
	if(locate_item(hPot) !== -1 
		&& locate_item(hPot) !== 37) swap(locate_item(hPot), 37);
	if(locate_item(mPot) !== -1 
		&& locate_item(mPot) !== 38)swap(locate_item(mPot), 38);
	//Compound Scroll
	if(locate_item("cscroll1") !== -1 
		&& locate_item("cscroll1") !== 35)swap(locate_item("cscroll0"), 39);
	//Upgrade Scroll
	if(locate_item("scroll1") !== -1 
		&& locate_item("scroll1") !== 36)swap(locate_item("scroll0"), 40);  
	//Compound Scroll
	if(locate_item("cscroll0") !== -1 
		&& locate_item("cscroll0") !== 39)swap(locate_item("cscroll0"), 39);
	//Upgrade Scroll
	if(locate_item("scroll0") !== -1 
		&& locate_item("scroll0") !== 40)swap(locate_item("scroll0"), 40);
}

//on_party_invite gets called _automatically_ by the game on an invite 
function on_party_invite(name) 
{

	if ( whiteList.includes(name) )
	{
		accept_party_invite(name);
	}
}


function usePotions() 	//Replenish Health and Mana
{ 
	if(character.rip) return;

	let hPotGives = G.items[hPot].gives[0][1];
	let mPotGives = G.items[mPot].gives[0][1];
	if(character.hp < (character.max_hp - hPotGives) || character.mp < (character.max_mp - mPotGives) || character.mp < 50 || character.hp < 50) 
	{
	use_hp_or_mp();
	}
}

function getHolidayBuff(){
    
    if ((new Date().getHours() === 00
        || new Date().getHours() === 12)
       && new Date().getMinutes() === 00){
        
        smart_move({to:"town"}, () => {
            parent.socket.emit("interaction",{type:"newyear_tree"});
        });
    }
}

function restoreParty(){
	if(parent.party_list.length < 3){
		log("Restoring party.");
		loadCharacters();
		log("Party Restored.");
	}
}

function on_magiport(name){
	if(character.ctype === "merchant"){
		accept_magiport(name);
	}
}

function getEmptyInventorySlotCount()
{
	let emptyInvSlots = 0;
	for (let item of character.items)
	{
		if (!item)
		{
			emptyInvSlots++;
		}
	}

	return emptyInvSlots;
}

function approachTarget(target, onComplete)
{
	if (!target)
	{
		return;
	}

	if (!onComplete)
	{
		move(
			character.x + (target.x - character.x) * 0.3,
			character.y + (target.y - character.y) * 0.3
		);
	}
	else
	{
		smart_move({ x: character.x + (target.x - character.x) * 0.3, y: character.y + (target.y - character.y) * 0.3 }, () => { onComplete(); });
	}
}

function hasUpgradableItems()
{
	if (character.items.find((x) => { if (x && upgradeItemList.includes(x.name) && x.level < upgradeItemLevel2) return x; }))
	{
		return true;
	}

	return false;
}

function isInTown()
{
	if((character.map == merchantStandMap && simple_distance(character, merchantStandCoords) < 1000))
	{
		return true;
	}
	else
	{
		return false;
	}
}

function isAtFarmSpot()
{
	let farmspot = getFarmingSpot(farmMonsterName, farmMap, farmMonsterNr,"coord");
	if(character.map == farmMap && distance(character, farmspot) < 400)
	{
		return true;
	}
	else
	{
		return false;
	}
}

function goBackToTown(delay = 5000)
{
	if (returningToTown)
	{
		return;
	}

	stop();

	log(character.name + " returning to town.");

	returningToTown = true;

	use_skill("town");

	setTimeout(function ()
	{
		goTo(merchantStandMap, merchantStandCoords, () => { returningToTown = false });
	}, delay);
}

function goTo(mapName = "main", coords = { x: 0, y: 0 }, oncomplete = null)
{
	traveling = true;

	if (character.map != mapName)
	{
		if (oncomplete != null)
		{
			smart_move(mapName, () => { oncomplete(); traveling = false; });
		}
		else
		{
			smart_move(mapName, () => { traveling = false; });
		}
	}
	else
	{
		if (oncomplete != null)
		{
			smart_move(coords, () => { oncomplete(); traveling = false; });
		}
		else
		{
			smart_move(coords, () => { traveling = false; });
		}
	}
}

function depositInventoryAtBank()
{
	if (!isInTown())
	{
		goBackToTown();
		return;
	}

	log("Depositing inventory at bank...");
	banking = true;

	smart_move("bank", () =>
	{
		/* //	store in first bank
		let storeCompounds = (getEmptyInventorySlotCount() < 8);
		storeInventoryInBankVault(0, storeCompounds);

		//	store in second bank
		if (checkForLowInventorySpace())
		{
			setTimeout(() =>
			{
				storeCompounds = (getEmptyInventorySlotCount() < 8);
				storeInventoryInBankVault(1, storeCompounds);
				banking = false;

			}, 1000);
		} 
		
		else
		{
			banking = false;
		}*/
		depositItems();
		depositMoney();
		banking = false;

	});
}

function checkMluck(target)
{
	return (target.s.mluck && target.s.mluck.f == merchantName) || (target.s.mluck && target.s.mluck.ms < mluckDuration * 0.5);
}

function requestMluck()
{
	if (sentRequests.find((x) => { if (x.message == "mluck") return x; }))
	{
		log(character.name + " waiting for Mluck, resending request...");
	}
	else
	{
		log(character.name + " requesting Mluck");
		sentRequests.push({ message: "mluck", name: merchantName });
	}

	let data = { message: "mluck", name: character.name, x: character.x, y: character.y, map: character.map};
	send_cm(merchantName, data);
}

function checkBuffs()
{
	if (character.name === merchantName) return;
	let mluck = false;
	//let elixir = false;


	//	check that you have mLuck from your own merchant
	if (checkMluck(character))
	{
		mluck = true;
	}
	else
	{
		//	if you have someone elses mluck and are in town just accept it, merchant will fix it after party leaves town
		if (character.s.mluck && isInTown())
		{
			mluck = true;
		}
		else
		{
			mluck = false;
		}
	}

	if (!mluck)
	{
		requestMluck();
	}

	//elixir = checkElixirBuff();

	return (mluck);
	//return (mluck && elixir);
}


function requestTeleport() {
	let data = {message:"I need a teleport!", requestTeleport: true}
	send_cm(mageName, data);
}

function checkSentRequests()
{
	if (sentRequests.length == 0)
	{
		return;
	}

	log("Checking request status...");

	for (let i = sentRequests.length - 1; i >= 0; i--)
	{
		let recieved = false;

		if (sentRequests[i].message == "mluck")
		{
			if (checkMluck(character))
			{
				log("Mluck recieved. Thank you!");
				recieved = true;
			}
		}
		else if (sentRequests[i].message == "potions")
		{
			if (checkPotionInventory())
			{
				log("Potions recieved. Thank you!");
				recieved = true;
			}
		}
		else if (sentRequests[i].message == "elixir")
		{
			if (checkElixirBuff())
			{
				log("Elixir recieved. Thank you!");
				recieved = true;
			}
		}

		if (recieved)
		{
			send_cm(sentRequests[i].name, { message: "thanks", request: sentRequests[i].message });
			sentRequests.splice(i, 1);
		}
	}
}

function checkPotionInventory()
{
	// merchant shouldn't check for potions himself - this breaks the routine.
	if (character.name === merchantName) return;
	let hPotions = quantity(hPot);
	let mPotions = quantity(mPot);

	if (mPotions < mPotionThreshold || hPotions < hPotionThreshold)
	{
		let healthPotsNeeded = potionMax - hPotions;
		let manaPotsNeeded = potionMax - mPotions;

		if (healthPotsNeeded < 0)
		{
			healthPotsNeeded = 0;
		}
		if (manaPotsNeeded < 0)
		{
			manaPotsNeeded = 0;
		}

		let data = { message: "buyPots", hPots: healthPotsNeeded, mPots: manaPotsNeeded, x: character.x, y: character.y, map: character.map };
		send_cm(merchantName, data);

		if (sentRequests.find((x) => { if (x.message == "potions") return x; }))
		{
			log(character.name + " waiting for potions, resending request... ");

			//	try to fix the problem yourself if the merchant isn't responding
			if (hPotions == 0 || mPotions == 0)
			{
				log(character.name + " has no potions, is returning to town.");
				farmingModeActive = false;

				if (!returningToTown && !traveling)
				{
					traveling = true;
					goBackToTown();

					setTimeout(() =>
					{
						log(character.name + " attempting to buy potions.");
						buy_with_gold(hPot, healthPotsNeeded);
						buy_with_gold(mPot, manaPotsNeeded);

						traveling = false;
					}, 10000);
				}
			}
		}
		else
		{
			log(character.name + " sending request for potions");
			sentRequests.push({ message: "potions", name: merchantName });
		}

		return false;
	}
	else
	{
		return true;
	}
}

function doCombat(){


	if(!singleTarget)
	{
		target = engageTarget();
	}
	else if (Spadar)
	{
		ToT = "Brutus"
		target = get_target_of(parent.entities[ToT]);
	}
	else
	{
		approachLeader();
		target = singleTargetCombat();
	}
	

	if(target)
	{
		//Kites Target
		//kiteTarget(target);
		//Circles Target
		//circleTarget(target);
		//Uses available skills
		if(character.ctype === "mage") mageSkills(target);
		if(character.ctype === "priest") priestSkills(target);
		if(character.ctype === "ranger") rangerSkills(target, farmMonsterName);
		if(character.ctype === "warrior") warriorSkills(target, farmMonsterName);
		//Attacks the target
		autoFight(target);
	}
	else 
	{	//Go to Farming Area
		if(!isAtFarmSpot()){
			getFarmingSpot(farmMonsterName, farmMap, farmMonsterNr, "move");
		}
	
	}
}

function engageTarget()
{
	//Finds a suitable target and attacks it. Also returns the target!
	let target = null;

	//  look for any special targets
	for(let i = 0; i < specialMonsters.length; i++)
	{
		target = getTarget(specialMonsters[i]);
	}

	//  look for the monster you are farming
	if(!target)
	{
		target = getTarget(farmMonsterName);
	}
	
	return target;

	
}

function singleTargetCombat()
{
	let target = null;
	
	if(character.name == mainTank.name)
	{
		target = engageTarget();
	}
	else
	{
	 	target = get_target_of(parent.entities[mainTank.name]);
	}

	return target;

}

function getTarget(farmTarget){

	let target = get_targeted_monster();
	if(target) return target;
	
	if(!target)
	{
		//Returns monster that targets character
		target = get_nearest_monster({target:character.name});
		if(target)
		{
			change_target(target);
			return target;
		}
		//Returns monster that targets party-member
		partyList.forEach(element => {
			target = get_nearest_monster({target:element});
			if(target)
			{
				change_target(target);
				return target;
			}
		});
		//Returns any monster that targets nobody
		target = get_nearest_monster({
			
			//no_target:false,
			type:farmTarget
		});
		if(target){
			//log("finding a target no one is fighting");
			change_target(target);
			return target;
		}
	}
}

function autoFight(target){
	if(!target) return;

	if(specialMonsters.includes(target.mtype) && (character.ctype === "warrior"))
	{
		if(target.mtype === "stompy")
		{
			move(422,-2423)
		}
	}

	if(!is_in_range( target, "attack"))
	{
		if (stationary)
		{
			target = get_nearest_monster({type:farmMonsterName});
			change_target(target);
		}
		else
		{
			move(
				character.x + (target.x - character.x) * 0.2,
				character.y + (target.y - character.y) * 0.2
			);
		}
	}

	// else if ( !is_on_cooldown("attack") )
	// {
	// 	{
	// 		attack(target);
	// 		reduce_cooldown("attack", character.ping*1.1);
	// 	}
	// }
	
	
    // else if (!is_on_cooldown("attack")){
		
	// 	if(target.hp<1) return;
	// 	else
	// 	{
	// 		attack(target).then((message) => 
	// 		{
	// 			let cooldownReduction = Math.min(character.ping, 250);
	// 			reduce_cooldown("attack", cooldownReduction);
	// 			log("reduced cooldown by " + cooldownReduction);
	// 		})
	// 		.catch((message) => 
	// 		{
	// 			if (message.reason ==="cooldown")
	// 			{
	// 				log(character.ctype + " attack failed: " + message.reason + " of "+ message.remaining);
	// 			}
	// 		});
	// 	}
	// }
	
	////	from egehawk	////
	if (!is_on_cooldown("attack") && (!window.last_attack || mssince(window.last_attack) > 500)){
		if (character.ctype === "warrior") equipWeapon();
		window.last_attack = new Date();
		attack(target).then((message) => {
			reduce_cooldown("attack", Math.min(character.ping, 250));
			window.last_attack = new Date(0);
			if (character.ctype === "warrior") equipShield();
		}).catch((message) => {
		//	log(character.ctype + " attack failed: " + message.reason);
			if (character.ctype === "warrior") equipShield();
		});
	}
}
////// CM //////

function on_cm(sender, data)
{
	if(!whiteList.includes(sender)){
		game_log("CM from outside whitelist" + sender);
		game_log("Data from outside sender" + data);
		return;
	}
	game_log("Received a CM from " + sender + " with payload: " + data.message);


	if (character.ctype === "merchant")
	{
		merchant_on_cm(sender, data);
	}
	else if (character.ctype === "mage")
	{
		mage_on_cm(sender, data);
	}
	else if (character.ctype === "priest")
	{
		priest_on_cm(sender, data);
	}
	else if (character.ctpye === "ranger")
	{
		ranger_on_cm(sender, data);
	}
		
}


//////		Extra functions		//////


function findWeaponDamage(itemName, upgradeLevel, outputMethod=true)
{
	let weaponData = {name: itemName, level: upgradeLevel};
	let output = item_properties(weaponData).attack;
	if(outputMethod)
	{
		log("+" + upgradeLevel + " " + itemName + " - " + output + " attack")
	}
	else if (!outputMethod) 
	{
		return output;
	}
}

function characterMainhand()
{
	let cMainhand = character.slots.mainhand;
	let output = item_properties(cMainhand).attack;
	return output;
}

function characterMainstat()
{
	let ctype = character.ctype;
	let main_stat = character[G.classes[ctype].main_stat];
	return main_stat;
}

function calc_attack(mainhand = characterMainhand(), main_stat = characterMainstat(), ctype = character.ctype, offhand=0, bonus_attack=0)
{
	// ctype: character class
	// main_stat: Amount of points in the classes' main stat
	// mainhand/offhand: Weapon damage of the respective slot
	// Note: mainhand damage scales better, so put your strongest weapon in the mainhand
	// bonus_attack: Sum of all attack boni from achievments
	// Note: priests have 60% more attack value, but only 40% of that contributes to actual damage => 1.6*0.4 = 0.64
	// for the effective attack of a priest multiply result with 0.64

	let base_dmg = G.classes[ctype].attack;
	let attack = Math.round ( 0.05 * main_stat * (mainhand + 0.7 * offhand) + mainhand + offhand + base_dmg + bonus_attack );
	log(attack + " attack | " + mainhand + " weapon | " + main_stat + " " + G.classes[ctype].main_stat);
	return attack

}

function compareWeapons(first, second)
{
	if(!first || !second) return;
	let firstDmg = calc_attack(first);
	let secondDmg = calc_attack(second);

}

function calc_frequency(ctype = character.ctype, dex = character.dex, int = character.int, level = character.level, bonus_attackspeed=0, gear_attackspeed=0){
	// ctype: character class
	// dex: Dexterity stat points
	// int: Intelligence stat points
	// level: Character level
	// bonus_attackspeed: Sum of all boni to attackspeed from achievements. Use displayed value
	// gear_attackspeed: Sum of all boni to attackspeed from gear. Use displayed value
	let freq = 4/59/100*int + 12/99/100*dex + 2/3/100 * level + G.classes[ctype].frequency + bonus_attackspeed/100 + gear_attackspeed/100;
	return freq;
}

// Shows some experience stats for your party
function reportCard()
	{
	let output = []

	for (let p of partyList)
	{
		let player = get_player(p);

		if (player)
		{
			let percent = (player.xp / G.levels[player.level]) * 100;
			output.push(player.name + ": L" + player.level + " " + player.ctype+ " with " + percent.toLocaleString(undefined, {maximumFractionDigits:2}) + "%");
		}
	}

	show_json(output);
}

function on_combined_damage() // When multiple characters stay in the same spot, they receive combined damage, this function gets called whenever a monster deals combined damage
{
	move(character.real_x + (Math.random()*50)-25, character.real_y + (Math.random()*50)-25);
}

// Reload code on character
function reloadCharacter(name)
{
    if (name === character.name)
    {
        say("/pure_eval setTimeout(()=>{parent.start_runner()}, 500)");
        parent.stop_runner();
    } 
    else
    {
        command_character(name, "say(\"/pure_eval setTimeout(()=>{start_runner()}, 500)\")");
        command_character(name, "say(\"/pure_eval stop_runner();\")");
    }
}

function reloadCharacters()
{
    for(let i = 0; i < partyList.length; i++)
    {
        let name = partyList[i];
        if (name !== character.name && get_active_characters()[name])
        {
            reloadCharacter(name);
        }    
    }

    setTimeout(() =>
    {
        reloadCharacter(character.name);
    }, 1000);
}

// function on_hit(data){
// 	log(data);
// }



// let totalDamage = 0;
// let startDps = new Date();
// let timeSince = 0;
// let dps = 0;

// character.on("target_hit", function(data){
// 	totalDamage = totalDamage + data.damage;
// 	dps = Math.round(totalDamage/timeSince*1000);
// 	timeSince = mssince(startDps);
	


// });
// setInterval(announceDPS, 300000);

// function announceDPS()
// {
// 	log ( character.ctype +" " + dps + " dps | " + totalDamage + "  dmg | " + Math.round(timeSince/1000/60) + " min");
// }



// (() => {
// 	// Register listener to cleanup when script terminates
// 	window.addEventListener('unload', cleanup);
// 	let recentCalls = [];
// 	// Create a backup of original function persisted in parent
// 	if (!parent.socketEmit) parent.socketEmit = parent.socket.emit;
// 	// Extend original render_party() function
// 	parent.socket.emit = (packet, data) => {
// 	  recentCalls = recentCalls.filter(({ time }) => Date.now() - time < 4000);
// 	  if (recentCalls.reduce((total, { id }) => packet === id ? total + 1 : total, 0) < 48) {
// 		parent.socketEmit(packet, data);
// 		recentCalls.push({ id: packet, time: Date.now() });
// 	  } else {
// 		console.error(`Blocked socket emit for ${packet} because of too many recent calls.`);
// 	  }
// 	};
// 	function cleanup() {
// 	  if (parent.socketEmit) parent.socket.emit = parent.socketEmit;
// 	}
// })();



	

//////		from lotus		//////
function circleCoords(x=0, y=0, radius=100)
{
	
	let targetPos = {x:x,y:y};
	let theta = Math.atan2(character.y - targetPos.y, character.x - targetPos.x) + (180/Math.PI);
	targetPos.x += Math.cos(theta) * radius;
	targetPos.y += Math.sin(theta) * radius;

	move(targetPos.x, targetPos.y);
}


function upgradeChance()
{
	let probability = 1;
	for (let i = 0; i < baseChance.length; i++)
	{
		probability = (baseChance[i]/100) * probability
		log(" total probability for +" + (i+1) + " is "+ Math.round((probability*100)*1000)/1000 + "% chance")
	}
}

adjustedBaseChance = [100.00,   98.00,   95.00,   71.26,   61.42,   41.38,   52.7,   31.02,   15.1,   6.5,   28.00,   22.00,];
function adjustedUpgradeChance()
{
	let probability = 1;
	for (let i = 0; i < adjustedBaseChance.length; i++)
	{
		probability = (adjustedBaseChance[i]/100) * probability
		log(" total probability for +" + (i+1) + " is "+ Math.round((probability*100)*1000)/1000 + "% chance")
	}
}

function equipWeapon()
{
	if (character.slots.offhand.name === "sshield")
	{

		equip(40,"offhand")
	}
	else if (character.slots.offhand.name === "fireblade")
	{
		// do nothing
		return;
	}
}

function equipShield()
{
	if (character.slots.offhand.name === "fireblade")
	{
		
		equip(40,"offhand")
	}
	else if (character.slots.offhand.name === "sshield")
	{
		// do nothing
		return;
	}
}


function approachLeader()
{
	if (character.name !== mainTank.name)
	{
		let leaderEntity = get_player(mainTank.name);
		if (character.name == rangerName && Spadar) leaderEntity = get_player("SpadarFaar");
		if (leaderEntity && isAtFarmSpot() &&  (distance(character,leaderEntity) > 10) )
		{
			move(
				character.x + (leaderEntity.x - character.x) * 0.2,
				character.y + (leaderEntity.y - character.y) * 0.2
			);
		}


	}
}


// browser-like zoom functionality for steam client
(function () {    
    if (typeof require !== 'undefined') {
        const { webFrame } = require('electron');
        class Zoom {
            constructor() {
                this.zoom_factors = [0.25, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 2, 2.5, 3, 4, 5];
                this.index = this.zoom_factors.findIndex(value => value >= webFrame.getZoomFactor());
            }
            zoom_in() {
                if (this.index + 1 < this.zoom_factors.length) this.index++;
                webFrame.setZoomFactor(this.zoom_factors[this.index]);
            }
            zoom_out() {
                if (this.index > 0) this.index--; 
                webFrame.setZoomFactor(this.zoom_factors[this.index]);
            }
        }
        var zoom = new Zoom();
        var is_control_down = false;
        parent.window.addEventListener("keydown", function (event) {
            if (event.key == "Control") is_control_down = true;
            if (event.repeat) return; // key is still pressed down
            if (is_control_down && event.key == "=") zoom.zoom_out();
            if (is_control_down && event.key == "-") zoom.zoom_in();
        });
        parent.window.addEventListener("keyup", function (event) {
            if (event.key == "Control") is_control_down = false;
        });
        parent.window.addEventListener("wheel", function (event) {
            if (!is_control_down) return;
            if (event.deltaY < 0) { zoom.zoom_in(); }
            else { zoom.zoom_out(); }
        });
    }
})();


//		from Mish		//
/*
move: (target, opt) => {
	opt = opt || {}
	if (target === null) return;
	const movedRecently = mssince(last_move) < (opt.delay || 2000)
	if (!movedRecently || !is_in_range(target)) {
		for (var iAngle = 0; iAngle < 360; iAngle = iAngle + 15) {
			const distance = opt.range || character.range;
			for (var jRange = 0; (jRange + 15) < distance; jRange = jRange + 15) {
				const angle = (opt.angle || 180) + (opt.relative ? target.angle : getAngle(character, target).angleDeg) + iAngle;
				const toRad = ((Math.PI) / 180);

				const x = Math.cos(angle * toRad) * (distance - jRange);
				const y = Math.sin(angle * toRad) * (distance - jRange);
				const targetX = target.x
				const targetY = target.y
				const gotoX = targetX + x
				const gotoY = targetY + y
				const deltaX = gotoX - character.going_x;
				const deltaY = gotoY - character.going_y;
				if (gotoX === character.going_x && gotoY === character.going_y) return;
				const ddist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
				if (ddist < 5) return;
				if (!can_move_to(gotoX, gotoY)) {
					continue;
				}
				move(
					gotoX,
					gotoY
				)
				last_move = new Date();
				return;
			}
		}
	}
}

*/