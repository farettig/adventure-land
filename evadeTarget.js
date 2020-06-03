function kiteTarget(target){

	if(target){
		let minTargetDist = target.range * 2; 
		let kiteFlip = target.range * 1.1;
		let targetDistance = distance(character, target);
		
		if(targetDistance < minTargetDist && targetDistance > kiteFlip){
			move(
				character.real_x + (character.real_x - target.x),
				character.real_y + (character.real_y - target.y)
			);
		}
		if(distance(character, target) < kiteFlip){
			move(
				character.real_x - (character.real_x - target.x) + minTargetDist,
				character.real_y - (character.real_y - target.y) + minTargetDist
			);
		}
	}
}

function circleTarget(target){

    if(target){
        
        let minTargetDist = target.range * (target.speed / 3); 
        let targetDistance = distance(character, target);
        let offset = 0;     
        
        if(!localStorage.getItem(character.name + "Offset")){
            localStorage.setItem(character.name + "Offset", 0);
        }else{
            offset = Number(localStorage.getItem(character.name + "Offset"));
            offset += 0.8;
            if(offset >= 999999) offset = 0;
            localStorage.setItem(character.name + "Offset", offset);
        }
        if(targetDistance < minTargetDist){
            move(
                target.x + (minTargetDist * Math.sin(offset)),
                target.y + (minTargetDist * Math.cos(offset))
            );
        }
    }
}