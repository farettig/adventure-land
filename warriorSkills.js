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
        return;
    }
    
}

function warriorTaunt(target)
{
    if (get_target_of(target) && get_target_of(target) !== character && ( simple_distance(character,target) < G.skills.taunt.range ) && !is_on_cooldown("taunt") && character.mp > G.skills.taunt.mp)
    {
        // if (target.target == "Brutus" &&)
        stop();
        use_skill("taunt", target);
    }

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
        use_skill("warcry");
    }
}