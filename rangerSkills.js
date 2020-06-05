function rangerSkills(target, farmMonsterName){

    //How much Mana should be kept in reserve
    let manaReserve = 0.8;

    //Use Ranger Skills
    if(character.mp > (character.max_mp * manaReserve)){
        //3-Shot7
        if(character.mp > G.skills["3shot"].mp
            && !is_on_cooldown("attack")
            && !singleTarget){
            let targets = Object.values(parent.entities).filter(entity => entity.mtype === farmMonsterName && is_in_range(entity, "3shot"));
            if(targets.length >= 3) use_skill("3shot", targets);
            //game_log("Ranger used 3-Shot");
        }
        //Supershot
        if(character.mp > G.skills.supershot.mp
            && is_in_range(target, "supershot")
            && !is_on_cooldown("supershot")){
            use_skill("supershot");
            //game_log("Ranger used Supershot");
        }
        //Hunters Mark
        if(character.mp > G.skills.huntersmark.mp
           && is_in_range(target, "huntersmark")
           && !is_on_cooldown("huntersmark")){
            use_skill("huntersmark");
            //game_log("Ranger used Hunters Mark");
        }
    }
}

