let sentRequests = [];

function loadCharacters(){
	start_character("Matiin", "mainLoop");
	start_character("Matiiin", "mainLoop");
	//start_character("Matiiiin", "mainLoop");
	log("Loading Characters...");
	setTimeout(initParty, 8000);
}

function initParty(){
	send_party_invite("Matiin");
	send_party_invite("Matiiin");
	send_party_invite("Matiiiin");
	send_party_invite("Matiiiiin");

	log("Party Invites sent!");
}

function stopCharacters(){
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

function getTarget(farmTarget){

	let target = get_targeted_monster();
	if(target) return target;
	
	if(!target){
		//Returns monster that targets character
		target = get_nearest_monster({
			target:character.name
		});
		if(target){
			change_target(target);
			return target;
		}
		//Returns monster that targets party-member
		parent.party_list.forEach(partyMemberName => {
			target = get_nearest_monster({
				target:partyMemberName
			});
			if(target){
				change_target(target);
				return target;
			}
		});
		//Returns any monster that targets nobody
		target = get_nearest_monster({
			max_att:150,
			type:farmTarget,
			no_target:true
		});
		if(target){
			change_target(target);
			return target;
		}
	}
}

function autoFight(target){

    if(!is_in_range(target, "attack")){
        smart_move(
            character.x + (target.x - character.x) * 0.3,
            character.y + (target.y - character.y) * 0.3
        );
    }
    else if (!is_on_cooldown("attack")){
        attack(target).then((message) => {
            reduce_cooldown("attack", character.ping*.95);
        }).catch((message) => {
            log(character.name + " attack failed: " + message.reason);
        });
    }
}

function transferLoot(merchantName){
    let merchant = get_player(merchantName);
    if(character.ctype === "merchant") return;
    if(character.ctype !== "merchant"
       && merchant
       && merchant.owner === character.owner
       && distance(character, merchant) < 400){
        //Transfer Gold
        if(character.gold > 1000) send_gold(merchant, character.gold)
        //Transfer Items
        if(character.items.filter(element => element).length > 4){
            for(let i = 0; i <= 34; i++){
				if(character.items[i] && (character.items[i].name === hPot || character.items[i].name === mPot))
				{
					return;
				}
                send_item(merchant, i, 9999);
            }
            log(character.name + " sent items to merchant.");
        }
    }   
}

/* 
function relocateItems(){
    
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
 */


 //on_party_invite gets called _automatically_ by the game on an invite 
function on_party_invite(name) {

	if (whiteList.includes(name)){
		accept_party_invite(name);
	}
}


//Replenish Health and Mana
function usePotions(healthPotThreshold, manaPotThreshold){
    if(!character.rip
        && (character.hp < (character.max_hp - 200)
        || character.mp < (character.max_mp - 300))) use_hp_or_mp();
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
	if(parent.party_list.length < 4){
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
	return (character.map == merchantStandMap && distance(character, merchantStandCoords) < 200);
}

function goBackToTown(delay)
{
	if (returningToTown)
	{
		return;
	}

	stop();

	log(character.name + " returning to town.");

	returningToTown = true;

	use("use_town");

	setTimeout(function ()
	{
		goTo(merchantStandMap, merchantStandCoords, () => { returningToTown = false });
	}, 5000);
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

	let data = { message: "mluck", name: character.name };
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

		let potsList = { message: "buyPots", hPots: healthPotsNeeded, mPots: manaPotsNeeded };
		send_cm(merchantName, potsList);

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

////////////// CM //////////////

///		send_cm format
///		data = {message:"readyCheck",readyCheck:ready}
///		send_cm(recipient, data)
///		
///		data is an array and we can pass a lot of data. and reference it like data.message or (data.readyCheck == ready)





function on_cm(sender, data){
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



	if(data.walkToFarm){
		stop();
		merchantStatus.idle = false;
		smart_move({to:"fancypots"}, ()=>{
			getFarmingSpot(farmMonsterName, farmMap, farmMonsterNr, "move"), ()=> {
				transferPotions(mageName,mPot)
			};
		});
	}
		


	
		
	}



//////		Extra functions		//////

function calc_attack(ctype, mainhand, main_stat, offhand=0, bonus_attack=0){
	// ctype: character class
	// main_stat: Amount of points in the classes' main stat
	// mainhand/offhand: Weapon damage of the respective slot
	// Note: mainhand damage scales better, so put your strongest weapon in the mainhand
	// bonus_attack: Sum of all attack boni from achievments
	// Note: priests have 60% more attack value, but only 40% of that contributes to actual damage => 1.6*0.4 = 0.64
	// for the effective attack of a priest multiply result with 0.64
	let base_dmg = G.classes[ctype].attack
	let attack = 0.05 * main_stat * (mainhand + 0.7 * offhand) + mainhand + offhand + base_dmg + bonus_attack
	return attack
  }
  
  function calc_frequency(ctype, dex, int, level, bonus_attackspeed=0, gear_attackspeed=0){
	// ctype: character class
	// dex: Dexterity stat points
	// int: Intelligence stat points
	// level: Character level
	// bonus_attackspeed: Sum of all boni to attackspeed from achievements. Use displayed value
	// gear_attackspeed: Sum of all boni to attackspeed from gear. Use displayed value
	let freq = 0.000678*int + 0.001212*dex + 2/3/100 * level + G.classes[ctype].frequency + bonus_attackspeed/100 + gear_attackspeed/100
	return freq
  }

  function reportCard()
  {
      let output = "";
  
      for(let p of partyList)
      {
          let player = get_player(p);
  
          if(player)
          {
            let percent = (player.xp/G.levels[player.level])*100;
              output += player.name + ": Level " + player.level +" with "+ Math.round(percent) + "%     ";
          }
      }
  
      show_json(output);
  }
  
  
