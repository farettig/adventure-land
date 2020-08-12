
function saveEquipment(name)
{	
	let saveName = (character.name + "_" + name);
	let savedEquipment = [];
	let characterSlots = character.slots;
	for (id in characterSlots)
	{
		let slotName = {id:id};
		let object = characterSlots[id];
		let data = $.extend(slotName, object);
		//log(JSON.stringify(object));
		savedEquipment.push(data);
	}
	// show_json((savedEquipment));
	set(saveName,savedEquipment)
}


function loadEquipment(name)
{
	let saveName = (character.name + "_" + name);
	let equipLS = get(saveName);
	for(id in equipLS)
	{
		let storedItem = equipLS[id];
		let c_Equip = character.slots[storedItem.id];

		if(!storedItem.name)
		{
			if(c_Equip)	
			{
				unequip(storedItem.id);
			}
			continue;
		}
	
		if (c_Equip && storedItem.name == c_Equip.name 
		   && storedItem.level == c_Equip.level)  continue;

		for (let i=0; i < character.items.length; i++)
		{
			if(character.items[i] && (character.items[i].name==storedItem.name) && (character.items[i].level==storedItem.level))
			{
				equip(i,storedItem.id);
				continue;
			}
		}
	}
}
