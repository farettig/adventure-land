let oldTarget;
function priestSkills(target){

    //How much Mana should be kept in reserve
    let manaReserve = 0.5;
    let hurtPartyMembers = 0;
    let healingThreshold = (character.attack * .5);
    let partyHealThreshold = 1200;
  
    if (Spadar)
    {
        manaReserve = 0.5;
        hurtPartyMembers = 0;
        healingThreshold = (character.attack * .5);
        partyHealThreshold = 600;
    }



    //Priest heals tehmself
    if(character.hp < (character.max_hp - healingThreshold)
        && can_heal(character)
        && !is_on_cooldown("heal")
        && !is_on_cooldown("attack"))
    {
        oldTarget = get_target();
        heal(character);
        change_target(oldTarget);
     //   game_log("Priest is healing themself");
    }

    //parent.party_list is an array with the names of PartyMembers
    //We iterate over it
    parent.party_list.forEach(function(otherPlayerName)
    { 
        let partyMember = parent.entities[otherPlayerName];
        //...we have to check if party member holds something or is undefined!!!
        if (partyMember) 
        {
            //Heal COMPLETE Party
            if(character.hp < (character.max_hp - partyHealThreshold))    hurtPartyMembers++;
            if(partyMember.hp < (partyMember.max_hp - partyHealThreshold)
               && partyMember.rip === false) hurtPartyMembers++;

            if(hurtPartyMembers >= 2
               && character.mp >= G.skills.partyheal.mp
               && !is_on_cooldown("partyheal")){
                use_skill("partyheal");
               // game_log("Priest is healing Party");
            }
            //Heal ONE Partymember
            if(partyMember.hp < (partyMember.max_hp - healingThreshold)
                && !partyMember.rip
                //&& can_heal(partyMember)
                && is_in_range(partyMember, "heal")
                && !is_on_cooldown("attack")
                && !is_on_cooldown("heal")){
                heal(partyMember).then((message) => {
                    reduce_cooldown("heal", Math.min(character.ping, 250));
                    reduce_cooldown("attack", Math.min(character.ping, 250))
                    // game_log("Priest is healing " + partyMember.name);
                }).catch((message) => {
                   // log(character.name + " Heal failed: " + message.reason);
                });
            }
        }
    });
    if(target
        && character.mp > (character.max_mp * manaReserve)
        && character.mp > G.skills.curse.mp
        && is_in_range(target, "curse")
        && !is_on_cooldown("curse")
        && !target.s.curse)
    {
        use_skill("curse");
        // game_log("Priest cursed the enemy");
    }
    // if(singleTarget && get_target_of(target) && get_target_of(target) !== character && is_in_range(target,"absorb") && !is_on_cooldown("absorb") && character.mp > G.skills.absorb.mp)
    // {
    //     let friend = get_target_of(target);
    //     if(friend !== character){
    //         use_skill("absorb", friend);
    //         game_log("Priest took aggro");
    //     }
    // }

    if(character.level > 69 && !is_on_cooldown("darkblessing") && character.mp > G.skills.darkblessing.mp && !character.s.darkblessing)
    {
        use_skill("darkblessing");

    }

}