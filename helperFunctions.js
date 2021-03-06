

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
	if(character.ctype !== "merchant" && merchant && distance(character, merchant) < 400)
	{
        //Transfer Gold
		if(character.gold > reserveMoneyCombat*2)
		{
			send_gold(merchant, character.gold - reserveMoneyCombat)
		}
        //Transfer Items
		if(character.items.filter(element => element).length > 20)
		{
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
	let mluck = false;
	//let elixir = false;


	// //	check that you have mLuck from your own merchant
	// if (checkMluck(character))
	// {
	// 	mluck = true;
	// }
	// else
	// {
	// 	//	if you have someone elses mluck and are in town just accept it, merchant will fix it after party leaves town
	// 	if (character.s.mluck && isInTown())
	// 	{
	// 		mluck = true;
	// 	}
	// 	else
	// 	{
	// 		mluck = false;
	// 	}
	// }

	// if (!mluck)
	// {
	// 	requestMluck();
	// }


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


function sellTrash()
{
	for(let i = 0; i <= 41; i++)
	{
		if(character.items[i] && (trashName.indexOf(character.items[i].name) !== -1) && (character.items[i].level === 0)) 
		{
			sell(i, character.items.q);
		}
	}		
}


function checkPotionInventory()
{
	// merchant shouldn't check for potions himself - this breaks the routine.
	if (character.name === merchantName) return;
	
	let hPotions = quantity(hPot);
	let mPotions = quantity(mPot);


	let healthPotsNeeded = potionMax - hPotions;
	let manaPotsNeeded = potionMax - mPotions;

	if(healthPotsNeeded > 2000)
	{
		buy_with_gold(hPot, healthPotsNeeded);

	}
	if(manaPotsNeeded > 2000)
	{
		buy_with_gold(mPot, manaPotsNeeded);
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
		let slot = locate_item("handofmidas")
		delayedEquip(slot,"gloves")
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
		let slot = locate_item("mittens")
		delayedEquip(slot,"gloves")
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


//	From Rising	 //
function hasTitle(item){
	return item && item.p && Object.keys(G.titles).includes(item.p)
  }

function upgradeStuff()
{
	buyScrolls();

	if (upgrade_enable == true)
		{
			upgradeItems();
			//compound process
			if(findTriple(0)) compoundItems(0);
			if(findTriple(1)) compoundItems(1);
			if(findTriple(2)) compoundItems(2);
			// if(findTriple(3)) compoundItems(3);
		}
}

function compoundItems(level){
	if(character.q.upgrade){
		//log("Already combining something!");
		return;
	}
	let triple = findTriple(level);
	if(triple && triple.length === 3 && !character.q.compound && level === 2)
	{
		compound(triple[0],triple[1],triple[2],locate_item("cscroll1"));
		// log("Compounded an Item!");
	}

	else if(triple && triple.length === 3 && !character.q.compound)
	{
		compound(triple[0],triple[1],triple[2],locate_item("cscroll0"));
		// log("Compounded an Item!");
	}
}

function findTriple(level){
	let compoundTriple = [];
	for(let i = 0; i <= 41; i++){
		if(character.items[i]
			   && character.items[i].level === level
			   && (!character.items[i].p)
		   	//Weapons can't be compounded. If item has attack attr, no compound
			 //&& !G.items[character.items[i].name].attack
			 && G.items[character.items[i].name].compound
			 ){
			for(let j = i + 1; j <= 41; j++){
				if(character.items[j]
				   && character.items[j].name === character.items[i].name
				   && (!character.items[i].p)
				   && character.items[j].level === level){
					for(let k = j + 1; k <= 41; k++){
						if(character.items[k]
						   && character.items[k].name === character.items[j].name
						   && (!character.items[i].p)
						   && character.items[k].level === level){
							// log(" Slot i: "  + i + " item: " + character.items[i].name + " Slot j: "  + j + " item: " + character.items[j].name + " Slot k: "  + k + " item: " + character.items[k].name )
							compoundTriple.push(i, j, k);
							return compoundTriple
						}
					}
				}
			}
		}
	}
}

function upgradeItems()
{
	if(character.q.upgrade || (quantity("scroll0") < 1) || (quantity("scroll1") < 1))
	{
		//Already combining something!
		return;
	}
	
	for(let i = 0; i <= 41; i++)
	{
		if(character.items[i] && (character.items[i].level < upgradeItemLevel1) && (!character.items[i].p) && upgradeItemList.includes(character.items[i].name) && item_grade(character.items[i]) < 1 )
		{
			// log("Upgrade Started for item " + G.items[character.items[i].name].name + " +" + character.items[i].level);
			upgrade(i,locate_item("scroll0"));
			return;
		}
		else if(character.items[i] && (character.items[i].level < upgradeItemLevel2) && (!character.items[i].p) && upgradeItemList.includes(character.items[i].name))
		{
			// log("Upgrade Started for item " + G.items[character.items[i].name].name + " +" + character.items[i].level);
			upgrade(i,locate_item("scroll1"));
			return;
		}
	}
}


function buyScrolls(){
	if(quantity("cscroll0") <= minNormalCompoundScrolls){
		buy("cscroll0", (minNormalCompoundScrolls - quantity("cscroll0")));
		// log("Bought Normal Compound Scrolls!");
	}
	if(quantity("cscroll1") <= minRareCompoundScrolls){
		buy("cscroll1", (minRareCompoundScrolls - quantity("cscroll1")));
		// log("Bought Rare Compound Scrolls!");
	}
	if(quantity("scroll0") <= minNormalUpgradeScrolls){
		buy("scroll0", (minNormalUpgradeScrolls - quantity("scroll0")));
		// log("Bought Normal Upgrade Scrolls!");
	}
	if(quantity("scroll1") <= minRareUpgradeScrolls){
		buy("scroll1", (minRareUpgradeScrolls - quantity("scroll1")));
		// log("Bought Rare Upgrade Scrolls!");
	}
}


// Holiday's Buff
function happy_holidays()
{
    if(!G.maps.main.ref.newyear_tree) return;
    G.maps.main.ref.newyear_tree.return=true;
    // If first argument of "smart_move" includes "return"
    // You are placed back to your original point
    smart_move(G.maps.main.ref.newyear_tree,function(){
        // This executes when we reach our destination
        parent.socket.emit("interaction",{type:"newyear_tree"});
        say("Happy Holidays!");
    });
}
// happy_holidays()
