
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
                send_item(merchant, i, 9999);
            }
            log(character.name + " sent items to merchant.");
        }
    }   
}

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

function potionCheck(){
	if(character.ctype === "merchant") return;
	let mPotions = quantity(mPot);
	let	hPotions = quantity(hPot);


	if(hpRequestRecently && requestFulfilled){
		requestFulfilled = false;
		hpRequestRecently = false;
		let data = {message:"Health Potions restocked", lowHealthPots:false, idleStatus:true};
		send_cm(merchantName, data);
	}

	if(mpRequestRecently && requestFulfilled){
		requestFulfilled = false;
		mpRequestRecently = false;
		let data = {message:"Mana Potions restocked", lowManaPots:false, idleStatus:true};
		send_cm(merchantName, data);
	}

	
	if(!merchantStatus.idle) return;
 	requestFulfilled = false;


	if(mPotions < mPotionThreshold) {
		if(requestFulfilled)return;
		requestFulfilled = true;
		mpRequestRecently = true;
		let data = {message:"Low on Mana Potions", lowManaPots:true, idleStatus:false};
		send_cm(merchantName, data);
	}
	if(hPotions < hPotionThreshold) {
		if(requestFulfilled)return;
		requestFulfilled = true;
		hpRequestRecently = true;
		let data = {message:"Low on Health Potions", lowHealthPots:true, idleStatus:false};
		send_cm(merchantName, data);
	}

}

function mLuckCheck(){
	if(mluckRequestRecently && requestFulfilled){
		game_log("hello?");
		requestFulfilled = false;
		mluckRequestRecently = false;
		let data = {message:"No longer need mLuck Buff", needmLuck:false, idleStatus:true};
		send_cm(merchantName, data);
	}
	if(!merchantStatus.idle) return;
	if(!character.s.mluck || character.s.mluck.ms < mluckDuration * 0.25 || !character.s.mluck.f === merchantName){
		if(requestFulfilled)return;
		requestFulfilled = true;
		mluckRequestRecently = true;
		let data = {message:"Need mLuck Buff", needmLuck:true, idleStatus:false};
		send_cm(merchantName, data);
	} 


}

function requestTeleport() {
	let payload = {message:"I need a teleport!", requestTeleport: true}
	send_cm(mageName, payload);
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

	if(data.idleStatus) {
		merchantStatus.idle = true;
	}
	else if(!data.idleStatus) {
		merchantStatus.idle = false;
	}

	//teleport system
	if(data.requestTeleport){
		if(!character.ctype === "mage") return;
		game_log("Teleport Requested From "  + sender);
		use_skill("magiport", sender);
	}

	// potion delivery service
	if(data.lowHealthPots){
		hpRecently = true;
		buyPotions();
		setTimeout(requestTeleport, 1000);
		setTimeout(transferPotions, 2000, sender, hPot);
		setTimeout(use_skill, 1000, "town");
		let data = {message:"Request Fulfilled", requestFulfilled:true};
		send_cm(sender, data);
	}
	if(data.lowManaPots){
		mpRecently = true;
		buyPotions();
		setTimeout(requestTeleport, 1000);
		setTimeout(transferPotions, 2000, sender, mPot);
		setTimeout(use_skill, 1000, "town");
		let data = {message:"Request Fulfilled", requestFulfilled:true};
		send_cm(sender, data);
	}

	// everyone needs some luck
	if(data.needmLuck){
		mluckRecently = true;
		setTimeout(requestTeleport, 1000);
		setTimeout(merchantsLuck, 3000, sender);
		setTimeout(use_skill, 5000, "town");
		let data = {message:"Request Fulfilled", requestFulfilled:true};
		send_cm(sender, data);
	}
	if(data.requestFulfilled){
		requestFulfilled = true;
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