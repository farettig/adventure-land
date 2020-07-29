function rogueSkills(target, farmMonsterName)
{
    // buff the party
    rSpeed();

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
        // log("step1")
        if( mhType == "fist" && (character.mp > (G.skills.rspeed.mp + (character.mp_cost * 2))) && !is_on_cooldown("quickpunch") )
        {
            // log("quick attack on " + target.name)
            use_skill("quickpunch", target)
        }
        
    }
    
}
