
function rogueSkills(target, farmMonsterName)
{
    // buff the party
    rSpeed();

    
    mentalBurst(target);
    quickAttack(target);
    if ( !singleTarget )
    {

        return;
    }
    else if ( Spadar )
    {

        return;
    }
    else if ( singleTarget )
    {

        return;
    }
    
}



function rSpeed()
{
    let partyMember = [];
    for (let p of parent.party_list)
    {
        partyMember = get_entity(p);
        if ( (is_in_range(partyMember,"rspeed")) && partyMember && (!partyMember.s.rspeed || (partyMember.s.rspeed.duration < mluckDuration * .2))  )  
        {
            use_skill("rspeed", partyMember)
            // log(p+" rspeed");   
        }
    }
}

function quickAttack(target)
{
    let mainHand = character.slots.mainhand.name;
    let mhType = G.items[mainHand].wtype;

    if ( target )
    {
        let qARange = character.range * (G.skills.quickpunch.range_multiplier);
        if( (simple_distance(character,target) < qARange) && mhType == "fist" && (character.mp > (character.max_mp * 0.6)) && !is_on_cooldown("quickpunch") )
        {
            use_skill("quickpunch", target)
        }
    }
}

function mentalBurst(target)
{
    if ( target )
    {
        let mbRange = character.range * (G.skills.mentalburst.range_multiplier) + (G.skills.mentalburst.range_bonus);
        if( (simple_distance(character,target) < mbRange) && (character.mp > (G.skills.mentalburst.mp + (character.mp_cost * 2))) && !is_on_cooldown("mentalburst") && (character.int >= 64) )
        {
            // log("mentalburst used");
            use_skill("mentalburst", target);
        }
    }
}
