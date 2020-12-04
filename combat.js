function doCombat()
{

    if(singleTarget == false) target = engageTarget();
    else if (Spadar == true) 
    {
        ToT = "Brutus";
        target = get_target_of(parent.entities[ToT])
    }
    else 
    {
        target = singleTargetCombat();    
        if (farmMonsterName !== "bscorpion") approachLeader()
    }	
    if(character.ctype === "priest") priestSkills(target);

	if(target){
		if(character.ctype === "mage") mageSkills(target);
		if(character.ctype === "priest") priestSkills(target);
		if(character.ctype === "ranger") rangerSkills(target, farmMonsterName);
		if(character.ctype === "warrior") warriorSkills(target, farmMonsterName);
		if(character.ctype === "rogue") rogueSkills(target, farmMonsterName);
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
		return target;
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
	}

	//special bosses coop
	if (!target)
	{
		for(id in parent.entities)
		{
			let current = parent.entities[id];
			if(current.type !=="monster" || !current.visible || current.dead) continue;
			if(!can_move_to(current)) continue;
			if(!current.target) continue;
			if(!specialMonsters.includes(current.mtype)) continue;
			target = current;
		}		
	}
	return target;

}

function getTarget(farmTarget)
{

	let target = get_targeted_monster();

	if(target) 
	{
		if(specialMonsters.includes(target.mtype)) return target;
		if(target.target == mainTank.name) 
		{
			return target;
		}
		else if (target.target !== mainTank.name) target=null;
		
	}
	
	if(!target)
	{
        if(character.s.burned) { if(character.s.burned.intensity > burnCap) return;}

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
        
        //Returns Special Monster
        let specialAround = 0;
        for(id in parent.entities)
        {
            var current = parent.entities[id];
            if ( specialMonsters.includes(current.mtype)) 
            {
                change_target(current);
                return current;
            }
        }

		//Returns any monster that targets nobody
		target = get_nearest_monster({
			
			no_target:true,
			type:farmTarget
		});
		if(target){
			change_target(target);
			return target;
		}
	}
	return target;
}

function autoFight(target)
{
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
