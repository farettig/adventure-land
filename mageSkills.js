function mageSkills(target){

	//How much Mana should be kept in reserve
	let manaReserve = 0.8;
	let hpReserve = 0.8;
	
	//Shield Character
	if(character.hp < (character.max_hp * hpReserve)
	   && character.mp > G.skills.reflection.mp
	   && !is_on_cooldown("reflection")){
		use_skill("reflection", character);
		//game_log("Mage shielded himself");
	}
	
	//Energize and Shield Party Members
	//parent.party_list is an array with the names of PartyMembers
	//We iterate over it
	parent.party_list.forEach(function(otherPlayerName){ 
		// !!! IMPORTANT !!! parent.entities only holds OTHER players, not
		//the current player running this code!! Therefor....
		let partyMember = parent.entities[otherPlayerName];
		//...we have to check if party member holds something or is undefined!!!
		if(partyMember) {
			//Shield Partymenber
			if(character.mp > G.skills.reflection.mp
				&& partyMember.hp < (partyMember.max_hp * hpReserve)
			   	&& !partyMember.rip
			   	&& is_in_range(partyMember, "reflection")
			  	&& !is_on_cooldown("reflection")){
				use_skill("reflection", partyMember);
				//game_log("Mage shielded " + partyMember.name);
			}
			//Energize Partymenber
			if(character.mp > (character.max_mp * manaReserve)
			   	&& partyMember.mp < (partyMember.max_mp * manaReserve)
			   	&& !partyMember.rip
			   	&& is_in_range(partyMember, "energize")
			  	&& !is_on_cooldown("energize")){
				use_skill("energize", partyMember);
				//game_log("Mage energized " + partyMember.name);
			}
		}
	});

/* 	
//Burst
	if(target
	   && character.mp > (character.max_mp * manaReserve)
	   && target.hp >= (character.mp * 0.5)
	   && is_in_range(target, "burst")
	   && !is_on_cooldown("burst")){
		use_skill("burst");	
		game_log("Mage bursting enemy");
	} 
*/
}


function mage_on_cm(sender, data)
{
if(data.requestTeleport){
	if(!character.ctype === "mage") return;
	game_log("Teleport Requested From "  + sender);
	usePotions();
	// if(character.mp < G.skills.magiport.mp){
	// 	let data = {message:"Critically low on mana", idleStatus: false, walkToFarm: true}
	// 	send_cm(sender,data);
	// 	return;
	// }
	use_skill("magiport", sender);
}
}