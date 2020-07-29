function warriorSkills(target, farmMonsterName)
{
    if ( !singleTarget )
    {
        warriorCharge(target);
        warriorTaunt(target);
        warriorAOETaunt(target);
        warriorWarcry(target);
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
        warriorTaunt(target);
        warriorHardshell(target);
        warriorWarcry(target);
        warriorEarlyTaunt(target);
        return;
    }
    
}


function warriorEarlyTaunt(currentTarget)
{
    let currentlyTargeting = 0;
    let specialAround = 0;
    if(specialMonsters.includes(currentTarget.mtype)) return;

    for(id in parent.entities)
    {
        var current = parent.entities[id];
        if ( current.target == character.name ) currentlyTargeting++;
        if ( specialMonsters.includes(current.mtype)) specialAround++;
    }

    if ( (currentTarget.hp < (currentTarget.max_hp * .33)) && (currentlyTargeting < 2) && (specialAround == 0))
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
        
        if ( ( simple_distance(character,target) < G.skills.taunt.range ) && !is_on_cooldown("taunt") && character.mp > G.skills.taunt.mp)
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
        // if (target.target == "Brutus" &&)
        // stop();
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
    if ( (distance(character, target) > 50) && !is_on_cooldown("charge") && character.mp > G.skills.charge.mp )
    {
        use_skill("charge");
    }
}

function warriorHardshell(target)
{
    if ( target && !is_on_cooldown("hardshell") )
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