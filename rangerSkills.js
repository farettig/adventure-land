function rangerSkills(target, farmMonsterName)
{
    if (singleTarget && ((target.target == character.name) || !target.target)) return;
    ranger3shot()
    piercingShot();
    rangerHuntersMark();
    // rangerSuperShot();
    





    

}
function ranger3shot()
{
    if(character.mp > G.skills["3shot"].mp && !is_on_cooldown("attack") && (!singleTarget || Spadar || extraAggroLimit > 0))
    {    
        let targets = Object.values(parent.entities).filter(entity => entity.mtype === farmMonsterName && is_in_range(entity, "3shot") )
        if(targets.length >= 2)
        {
            use_skill("3shot", targets);
        }
    }
}

function ranger3shotTank()
{
    if(character.mp > G.skills["3shot"].mp && !is_on_cooldown("attack") && (!singleTarget || Spadar || extraAggroLimit > 0))
    {    
        let targets = Object.values(parent.entities).filter(entity => entity.mtype === farmMonsterName && is_in_range(entity, "3shot") && (entity.target == mainTank.name))
        if(targets.length >= 2)
        {
            use_skill("3shot", targets);
        }
    }
}

function rangerSuperShot()
{
    if(character.mp > G.skills.supershot.mp && is_in_range(target, "supershot") && !is_on_cooldown("supershot"))
    {
        use_skill("supershot",target);
        //game_log("Ranger used Supershot");
    }
}





function piercingShot()
{
    let piercingValue = damage_multiplier((G.monsters[farmMonsterName].armor)-(character.apiercing+G.skills.piercingshot.apiercing))
    let nonPiercingValue = damage_multiplier((G.monsters[farmMonsterName].armor)-(character.apiercing))
    
    if(piercingValue > nonPiercingValue)
    {
        if(character.mp > G.skills.piercingshot.mp && is_in_range( target, "attack") && !is_on_cooldown("attack"))
        {

                use_skill("piercingshot", target);
        }
    }
}

function rangerHuntersMark()
{
    if(target && (character.mp > G.skills.huntersmark.mp) && is_in_range(target, "huntersmark") && !is_on_cooldown("huntersmark") && !target.s.marked && (target.hp > (character.attack * 10)) )
    {
        use_skill("huntersmark");
        // log("cursed")
    }

}