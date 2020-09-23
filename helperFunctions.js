

// load all dudes
function loadCharacters(){
	//start_character(warriorName, "mainLoop");
	start_character(priestName, "mainLoop");
	// start_character(rangerName, "mainLoop");
	start_character(rogueName, "mainLoop");
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
	send_party_invite(rogueName);


	log("Party Invites sent!");
}

function stopCharacters(){
	stop_character("Matin");
	stop_character("Matiin");
	stop_character("Matiiin");
	stop_character("Matiiiin");
	stop_character("Matiiiiin");
	stop_character("Matiiiiiin");
	log("Characters stopped!");
}

function getFarmingSpot(farmMonsterName = "crab", farmMap = "main", farmMonsterNr = 8, action)
{
	if (specialCoords)
	{
		if(action === "move")
		{
			if(character.map != farmMap)
			{
				smart_move({to:farmMap});
			//If Map correct, go to Monster
			}
			else
			{
				smart_move({x:specialCoords.x,y:specialCoords.y});
			}
		}
		else if(action === "coord")
		{
			return specialCoords;
		}

	}
	else
	{
		for (map in G.maps)
		{
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
	if (specialCoords) farmspot = specialCoords;

	if(character.map == farmMap && distance(character, farmspot) < 600)
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
	if (soloMode && !parent.party_list.includes(merchantName)) return;
	if (character.name === merchantName || farmMonsterName === "ent") return;
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


	if(mainTank.name == character.name)
	{
		if(!character.slots.elixir)
		{
			let loc = locate_item("elixirluck");
			if (loc >= 0 )
			{
				use(loc);
			};
		}
	}
	else 
	{
		if(!character.slots.elixir)
		{
			let loc = locate_item("pumpkinspice");
			if (loc >=0 )
			{
				use(loc);
			}
			
		}
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

	if (soloMode && !parent.party_list.includes(merchantName))
	{
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

	else if (mPotions < mPotionThreshold || hPotions < hPotionThreshold)
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


	if(singleTarget == false)
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
		target = singleTargetCombat();
		if (farmMonsterName !== "bscorpion") approachLeader();
		
	}
	
	if(character.ctype === "priest") priestSkills(target);
	if(target)
	{
		//Kites Target
		//kiteTarget(target);
		//Uses available skills
		if(character.ctype === "mage") mageSkills(target);
		if(character.ctype === "priest") priestSkills(target);
		if(character.ctype === "ranger") rangerSkills(target, farmMonsterName);
		if(character.ctype === "warrior") warriorSkills(target, farmMonsterName);
		if(character.ctype === "rogue") rogueSkills(target, farmMonsterName);
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
		let min_d=999999;
		let min_hp=1;
		for(id in parent.entities)
		{
			let current = parent.entities[id];
			if(current.type !=="monster" || !current.visible || current.dead) continue;
			if(current.target !== mainTank.name) continue;
			if(!can_move_to(current)) continue;
			let c_dist = parent.distance(character,current);
			let c_hp = (current.hp/current.max_hp);

			if((c_dist < min_d) && (c_hp < min_hp)) 
			{
				min_d = c_dist;
				min_hp = c_hp;
				target = current;
			}
		}

	return target;
	}

	return target;

}

function getTarget(farmTarget)
{

	let target = get_targeted_monster();
	if(target) return target;
	
	if(!target)
	{
		if(character.s.burned)
		{
			if(character.s.burned.intensity > burnCap) return;
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
		//Returns monster that targets character
		target = get_nearest_monster({target:character.name});
		if(target)
		{
			change_target(target);
			return target;
		}

		//Returns any monster that targets nobody
		target = get_nearest_monster({
			
			// no_target:true,
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

	if(specialMonsters.includes(target.mtype) && (character.ctype == mainTank.class))
	{
		if(target.mtype === "stompy")
		{
			if(simple_distance(character,specialCoords) > 20 ) 
			{
				move(specialCoords.x,specialCoords.y);
			}
		}
		if(target.mtype === "ent")
		{
			move(-435,-1882)
		}

		if(farmMonsterName === "bscorpion")
		{

			if(character.speed > 35) cruise(35);
			circleCoords(x=-400, y=-1250, radius=125)
			// if(simple_distance(character,target)<(character.range*.8))

		}
		
	}

	if(target.mtype === "fireroamer" && (character.ctype == mainTank.class))
	{
		let targetCoords = {x:168,y:-947}
		if (simple_distance(character,targetCoords) > 10)
		{
			move(targetCoords.x,targetCoords.y);
		}

		
	}

	if(is_in_range(target, "attack") == false)
	{
		if (stationary == true && singleTarget == false)
		{
			target = get_nearest_monster({type:farmMonsterName});
			change_target(target);
		}
		else if (stationary == false)
		{
			move(
				character.x + (target.x - character.x) * 0.2,
				character.y + (target.y - character.y) * 0.2
			);
		}
		else 
		{
			return;
		}
	}

	if (usePattack == true ) //&& pCanAttack == true
	{
		if (is_in_range(target, "attack") == false) return;
		attack(target)
	}
	else if (is_on_cooldown("attack") == false && (!window.last_attack || mssince(window.last_attack) > 500))
	{
		////	from egehawk	////
		//	rudimentary hazard achievment 
		// if (character.ctype === "warrior" && ( target.hp < character.attack * 2)) return;
		// if (( target.hp < character.attack * 1.3) && target.s.burned) return;

		// if (character.ctype === "warrior") equipWeapon();
		window.last_attack = new Date();
		attack(target).then((message) => {
			reduce_cooldown("attack", Math.min(character.ping, 250));
			window.last_attack = new Date(0);
			// if (character.ctype === "warrior") equipShield();
		}).catch((message) => {
		//	log(character.ctype + " attack failed: " + message.reason);
			// if (character.ctype === "warrior") equipShield();
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
	if (cMainhand)
	{
		let output = item_properties(cMainhand).attack;
		return output;
	}

}

function characterOffhand()
{
	let cOffhand = character.slots.offhand;
	if (cOffhand)
	{
		let output = item_properties(cOffhand).attack;
		return output;
	}
}
function characterMainstat()
{
	let ctype = character.ctype;
	let main_stat = character[G.classes[ctype].main_stat];
	return main_stat;
}
//		credit to Rising in discord		//
function calc_attack(mainhand = characterMainhand(), offhand= characterOffhand(), main_stat = characterMainstat(), ctype = character.ctype, bonus_attack=0)
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
        parent.say("/pure_eval setTimeout(()=>{parent.start_runner()}, 500)");
        parent.stop_runner();
    } 
    else
    {
        command_character(name, "parent.say(\"/pure_eval setTimeout(()=>{start_runner()}, 500)\")");
        command_character(name, "parent.say(\"/pure_eval stop_runner();\")");
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
	if (!character.slots.offhand) return;
	if (character.slots.offhand.name == "sshield" || character.slots.offhand.name == "shield" || character.slots.offhand.name == "lantern")
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
	
	if (!character.slots.offhand) return;
	if (character.slots.offhand.name == "sshield" || character.slots.offhand.name == "shield"  || character.slots.offhand.name == "lantern")
	{
		// do nothing
		return;
	}
	else
	{
		
		equip(40,"offhand")
	}
}

let lastEquip = 0;
function delayedEquip(slot, name)
{
  if(new Date() - lastEquip > 100)
  {
     equip(slot, name);
     lastEquip = new Date();
  }
}

function equipLootGear()
{
	if ( character.ctype !== mainLooter.class && character.name !== mainLooter.name )
	{
		return;
	}


	if (character.slots.shoes.name !=="wshoes" && mainTank.name !== character.name)
	{	
		delayedEquip(35,"shoes")
	}
	if (character.slots.gloves.name !=="handofmidas" )
	{	
		delayedEquip(36,"gloves")
	}

}

function unequipLootGear()
{
	if ( character.ctype !== mainLooter.class && character.name !== mainLooter.name )
	{
		return;
	}

	
	if (character.slots.shoes.name !=="wingedboots" && mainTank.name !== character.name )
	{	
		delayedEquip(35,"shoes")
	}
	if (character.slots.gloves.name !=="mittens" )
	{	
		delayedEquip(36,"gloves")
	}

}


function lootRoutine()
{

	var totalChests = 0;
	if (character.ctype !== mainLooter.class) return;
	if (!parent.chests) return;

	for(id in parent.chests)
    {
        var current = parent.chests[id];
        if ( current ) totalChests++;
	}
	if (totalChests <= 0 && character.slots.gloves.name == "handofmidas")
	{
		unequipLootGear();
	}
	if (totalChests >= 1 )
	{
		equipLootGear();
		for (id in parent.chests)
		{
			if (character.slots.gloves.name == "handofmidas")
			{
				parent.open_chest(id);
				// log("looted with goldm gear");
			} 

			
		}
	}

}


function approachLeader()
{
	
	if (character.name !== mainTank.name)
	{
		let leaderEntity = get_player(mainTank.name);
		if (character.name == rangerName && Spadar) leaderEntity = get_player("SpadarFaar");
		if (leaderEntity && isAtFarmSpot() &&  (distance(character,leaderEntity) > 20) )
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

var servers = {};
parent.api_call("get_servers", {}, 
         {callback:setServers});

function setServers(response)
{
    if(response != null && response[0] != null)
    {
        servers = {};
        for(id in response[0].message)
        {
            var server = response[0].message[id];
            if(server.name != "TEST")
            {
                var serverObj = {};
                serverObj.name = server.region + server.name;
                serverObj.ip = server.ip;
                serverObj.port = server.port;
                serverObj.rewrite = "/in/" + server.region + "/" + server.name + "/";

                servers[serverObj.name] = serverObj;
            }
        }
    }
    console.log(servers);
}

function changeServer(name)
{
  var server = servers[name];

  if(server != null)
  {
    parent.window.location = parent.window.location.origin + "/character/" + character.name + server.rewrite;
  }
}

function dropAggro() 
{
	for(id in parent.entities)
	{
		let curr = parent.entities[id];
		if (curr.target == parent.character.name)
		{
			if (is_on_cooldown("scare") == false)
			{
				use_skill("scare", curr)
			}
		}

	}
}


function saveEquipment(name)
{	
	let saveName = (character.name + "_" + name);
	let savedEquipment = [];
	let characterSlots = character.slots;
	for (id in characterSlots)
	{
		let slotName = {id:id};
		let object = characterSlots[id];
		let data = $.extend(slotName, object);
		//log(JSON.stringify(object));
		savedEquipment.push(data);
	}
	// show_json((savedEquipment));
	set(saveName,savedEquipment)
}


function loadEquipment(name)
{
	let saveName = (character.name + "_" + name);
	let equipLS = get(saveName);
	for(id in equipLS)
	{
		let storedItem = equipLS[id];
		let c_Equip = character.slots[storedItem.id];

		if(!storedItem.name)
		{
			if(c_Equip)	
			{
				unequip(storedItem.id);
			}
			continue;
		}
	
		if (c_Equip && storedItem.name == c_Equip.name && storedItem.level == c_Equip.level)  continue;

		for (let i=0; i < character.items.length; i++)
		{
			if(character.items[i] && (character.items[i].name==storedItem.name) && (character.items[i].level==storedItem.level))
			{
				equip(i,storedItem.id);
				continue;
			}
		}
	}
}



map_key("B", "snippet", "const draw_text=(n,r,t) => { let a=new PIXI.Text(n,{fontFamily:parent.SZ.font,fontSize:36,fontWeight:\"bold\",fill:21760,align:\"center\"});a.x=r,a.y=t,a.type=\"text\",a.scale=new PIXI.Point(.5,.5),a.parentGroup=parent.text_layer,a.anchor.set(.5,1),parent.drawings.push(a),parent.map.addChild(a)},areas=G.maps[character.in].monsters,colors={boundary:21760,rage:11141120};for(const n in areas){const r=areas[n];for(const n in colors)if(n in r){const t=r[n][0],a=r[n][1],o=r[n][2],e=r[n][3],s=Math.round((t+o)/2),l=Math.round(a+Math.random()*(e-a));\"boundary\"===n&&draw_text(r.type+\": \"+r.count,s,l),draw_line(t,a,o,a,2,colors[n]),draw_line(o,a,o,e,2,colors[n]),draw_line(o,e,t,e,2,colors[n]),draw_line(t,e,t,a,2,colors[n])}}");

// function draw_spawns()
// {
// 	const draw_text=(n,r,t) => 
// 	{ 
// 		let a=new PIXI.Text(n,
// 		{
// 			fontFamily:parent.SZ.font,
// 			fontSize:36,
// 			fontWeight:"bold",
// 			fill:21760,
// 			align:"center"
// 		});
// 		a.x=r,
// 		a.y=t,
// 		a.type="text",
// 		a.scale=new PIXI.Point(.5,.5),
// 		a.parentGroup=parent.text_layer,
// 		a.anchor.set(.5,1),
// 		parent.drawings.push(a),
// 		parent.map.addChild(a)
// 	}
// 	areas=G.maps[character.in].monsters,
// 	colors={boundary:21760,rage:11141120};
// 	for(const n in areas)
// 	{
// 		const r=areas[n];
// 		for(const n in colors)
// 		{
// 			if(n in r)
// 			{
// 				const t=r[n][0],
// 				a=r[n][1],o=r[n][2],
// 				e=r[n][3],
// 				s=Math.round((t+o)/2),l=Math.round(a+Math.random()*(e-a));
// 				\"boundary\"===n&&draw_text(r.type+\": \"+r.count,s,l),
// 				draw_line(t,a,o,a,2,colors[n]),
// 				draw_line(o,a,o,e,2,colors[n]),
// 				draw_line(o,e,t,e,2,colors[n]),
// 				draw_line(t,e,t,a,2,colors[n])
// 			}
// 		}
// 	}
// }


// 		from egehanhk		//
// Sure, you know when you run a code character that character is run in an iframe. 
// You can access that iframe and therefore the entire context of that character.
// To get the parent of a code character you can do this
// From the code character's perspective it's easier to find the parent of the main character. You just use parent.parent

function get_parent(name, is_master) {
    if (is_master) {
        return parent.parent;
    } else {
        const char_iframe = parent.parent.$("#ichar"+name.toLowerCase())[0];
        if (char_iframe) {
            return char_iframe.contentWindow;
        }
    }
}



function characterStore()
{
	let data = {
		// "lastSeen": new Date(),
		// "items": getInventory(),
		// "attack": character.attack,
		// "frequency": character.frequency,
		// "goldm": character.goldm,
		// "last_ms": character.last_ms,
		// "luckm": character.luckm,
		"name": character.name,
		"class": character.ctype,
		"map": character.map,
		"x": character.real_x,
		"y": character.real_y,
		"s": character.s,
		"items": character.items
	}
	set(`characterStore_${character.name}`,data)
}