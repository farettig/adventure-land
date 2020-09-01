function test(stat)
{
    let stat_total = 0;
    let final = "";
    let achieved = 0;
	for (id in G.monsters)
	{
        let current = G.monsters[id];
		if(!current.achievements) continue;
		for (let i = 0; i < current.achievements.length; i++)
		{
            let tracker_max = parent.tracker.max.monsters[id];
			let currentAchievement = current.achievements[i];
			if (currentAchievement[2] == stat)
			{
                let new_entry = `+${currentAchievement[3]} ${currentAchievement[2]} from ${id}`; 
                final += new_entry;
                stat_total += currentAchievement[3];
                
                if(tracker_max && (tracker_max[0] > currentAchievement[0]))
                {
                    achieved += currentAchievement[3];
                    final += ` [achieved]`;
                }
                final+="\n";
			}
		}
    }

    console.log(final+"\n"+`${achieved} ${stat} already acquired`+"\n"+`${stat_total-achieved} ${stat} left to acquire`);
}

test("int")



