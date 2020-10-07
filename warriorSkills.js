

function warriorSkills(target, farmMonsterName)
{
    if ( !singleTarget )
    {
        warriorCharge(target);
        warriorWarcry(target);
        if(mainTank.name !== character.name && Spadar == "false") return; 
        warriorTaunt(target);
        // warriorAOETaunt(target);
        // warriorCleave(target);
        return;
    }
    else if ( Spadar )
    {
        warriorCharge(target);
        // warriorTaunt(target);
        warriorHardshell(target);
        warriorWarcry(target);
        return;
    }
    else if ( singleTarget )
    {
        warriorCharge(target);
        warriorHardshell(target);
        warriorWarcry(target);
        // warriorStomp(target);
        if(mainTank.name != character.name && Spadar == "false") return;
        warriorTaunt(target);
        warriorEarlyTaunt(target);
        return;
    }
    
}

function warriorCleave(target)
{
    let extraMobs = 0;
    let currentMobs = 0;
    for(id in parent.entities)
    {
        var current = parent.entities[id];
        if(current.type !=="monster" || !current.visible || current.dead) continue;
        if(parent.distance(character,current) > G.skills.cleave.range) continue;
        if(current.mtype !== farmMonsterName)
        {
            if(specialMonsters.includes(current.mtype))
            {
                return;
            }
            else
            {
                extraMobs++; 
                continue;
            }
        }  
        if(!can_move_to(current)) continue;
        currentMobs++;
    }
    if ( (currentMobs > 2) && (extraMobs == 0) && (!is_on_cooldown("cleave")) && (character.mp > (G.skills.cleave.mp + character.mp_cost*3)) && (is_in_range(target,"attack")))
    {
        use_skill("cleave");
    }

}

function warriorEarlyTaunt(currentTarget)
{
    if(character.s.burned)
    {
        if(character.s.burned.intensity > burnCap) return;
    } 
    let currentlyTargeting = 0;
    let specialAround = 0;
    if(specialMonsters.includes(currentTarget.mtype)) return;

    for(id in parent.entities)
    {
        var current = parent.entities[id];
        if ( current.target == character.name ) currentlyTargeting++;
        if ( specialMonsters.includes(current.mtype)) specialAround++;
    }

    if ( (currentTarget.hp < (currentTarget.max_hp * (extraAggroLimit*.4))) && (currentlyTargeting <= extraAggroLimit) && (specialAround == 0))
    {
        var min_d=999999,target=null;
        for(id in parent.entities)
        {
            var current = parent.entities[id];
            if(current.type !="monster" || !current.visible || current.dead) continue;
            if(current.mtype != farmMonsterName) continue;
            if(current.target == character.name) continue;
            if(current == currentTarget) continue;
            if(!can_move_to(current)) continue;
            var c_dist=parent.distance(character,current);
            if(c_dist<min_d) min_d=c_dist,target=current;
        }
        
        if ( target && (simple_distance(parent.character,target) < G.skills.taunt.range ) && !is_on_cooldown("taunt") && character.mp > G.skills.taunt.mp)
        {
            use_skill("taunt",target);
            change_target(currentTarget);
        }

    }
}

function warriorTaunt(target)
{
    if (get_target_of(target) !== character && ( simple_distance(character,target) < G.skills.taunt.range ) && !is_on_cooldown("taunt") && character.mp > G.skills.taunt.mp)
    {
        use_skill("taunt", target);
    }

    partyList.forEach(element => {target = get_nearest_monster({target:element});
        if(target && target.target !== mainTank.name && !is_on_cooldown("taunt") && ( simple_distance(character,target) < G.skills.taunt.range ))
        {
            use_skill("taunt", target);
        }
    });

}

function warriorAOETaunt(target)
{
    if ( (character.level > 67) && get_target_of(target) && get_target_of(target) !== character && is_in_range(target,"agitate") && !is_on_cooldown("agitate") && (character.mp > G.skills.taunt.mp) )
    {
        use_skill("agitate", target);
    }

}

function warriorCharge(target)
{
    if ( (distance(character, target) > 50) && !is_on_cooldown("charge") )
    {
        use_skill("charge");
    }
}

function warriorHardshell(target)
{
    if ( target && !is_on_cooldown("hardshell") && character.hp <= (character.max_hp * .65))
    {
        use_skill("hardshell");
    }
}

function warriorWarcry(target)
{
    if ( target && !is_on_cooldown("warcry") && !character.s.warcry)
    {
        if ( parent.party_list.includes(priestName) && parent.entities[priestName] )
        {
           if (character.s.darkblessing) 
           {
                use_skill("warcry");
           }
           else
           {
               return;
           }
        } 
        else
        {
            use_skill("warcry");
        }
        
    }
}

function warriorStomp(target)
{
    if(!target)return;
    if(is_on_cooldown("stomp")) 
    {
        if(character.slots.mainhand.name == "basher")
        {
            loadEquipment("basher-preswap")
        }
        return;
    }

    if((target.hp < target.max_hp * 0.05) || (target.hp > target.max_hp * 0.99)) return;
    if(simple_distance(character,target) > character.range) return;
    // saveEquipment("basher-preswap");
    unequip("offhand");

    delayedEquip(locate_item("basher"),"mainhand");

    if(character.slots.mainhand.name == "basher")
    {
        use_skill("stomp");
    }



}