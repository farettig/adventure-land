    //  settings    //
    let manaReserve = 0.5;
    let hurtPartyMembers = 0;
    let healingThreshold = (character.attack * .9);
    let partyHealThreshold = findPartyHealValue() + G.items[hPot].gives[0][1];
    
    
    function priestSkills(target)
    {
    
        if (Spadar)
        {
            manaReserve = 0.5;
            hurtPartyMembers = 0;
            healingThreshold = (character.attack * .5);
            partyHealThreshold = 600;
        }
    
        priestCurse(target);
        priestDarkBlessing();
        priestSelfHeal(target);
        priestHealParty();
        
        priestSingleHeal(target);
    
    
    }
    
    function priestSelfHeal (oldTarget)
    {
            //Priest heals themselves
            if(character.hp < (character.max_hp - healingThreshold)
            && can_heal(character)
            && !is_on_cooldown("heal")
            && !is_on_cooldown("attack"))
        {
            
            heal(character);
            change_target(oldTarget);
        //    game_log("selfheal");
        }
    
    }
    
    function priestHealParty()
    {
        if( (findHurtPartyHeal() > 0) && character.mp >= G.skills.partyheal.mp && !is_on_cooldown("partyheal"))
        {
             use_skill("partyheal");
             log("partyheal")
        }
    }
    
    function priestSingleHeal(oldTarget)
    {
        let partyMember = findHurtSingleHeal()
        if(partyMember && is_in_range(partyMember, "heal") && !is_on_cooldown("attack") && !is_on_cooldown("heal"))
        {
        heal(partyMember).then((message) => {
            reduce_cooldown("heal", Math.min(character.ping, 250));
            reduce_cooldown("attack", Math.min(character.ping, 250))
            game_log("healing " + partyMember.name);
        }).catch((message) => {
           // log(character.name + " Heal failed: " + message.reason);
        })};
        
        change_target(oldTarget);
    }
    
    function priestCurse(target)
    {
        if(target && (character.mp > G.skills.curse.mp) && is_in_range(target, "curse") && !is_on_cooldown("curse") && !target.s.cursed && (target.hp > (character.attack * 3)) )
        {
            use_skill("curse");
            // log("cursed")
        }
    }
    
    function findHurtPartyHeal()
    {
        let hurtPartyMembers = 0;
        parent.party_list.forEach(function(otherPlayerName)
        { 
            let partyMember = parent.entities[otherPlayerName];
            if (partyMember && partyMember.hp < (partyMember.max_hp - partyHealThreshold) && partyMember.rip === false) hurtPartyMembers++;
        });
        
        if(character.hp < (character.max_hp - partyHealThreshold))    hurtPartyMembers++;
    
        return hurtPartyMembers;
    }
    
    function findHurtSingleHeal()
    {
        for(id in parent.entities)
        {
            var partyMember = parent.entities[id];
            if (parent.party_list.includes(partyMember.name))
            {
                if (partyMember && (partyMember.hp < (partyMember.max_hp - healingThreshold)) && !partyMember.rip) 
                {
                    return partyMember;
                }
            }
        }	
    }
    
    
    function findPartyHealValue()
    {
        let healAmount = 0;
        for (amount of G.skills.partyheal.levels)
        {
            if (character.level > amount[0]) healAmount = amount[1]
        }
        return healAmount;
    }
    
    function priestDarkBlessing()
    {
        if(character.level > 69 && !is_on_cooldown("darkblessing") && character.mp > G.skills.darkblessing.mp && !character.s.darkblessing)
        {
            use_skill("darkblessing");
            // log("darkblessing")
    
        }
    
    }