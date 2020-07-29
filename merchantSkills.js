var vendorMode = false;			//	true when in town with shop, false when busy delivering items
var deliveryMode = false;		//	true when the merchant has requests it needs to fulfill
var exchangeMode = false;		//	true when the merchant is busy exchanging items with an npc
var deliveryShipments = [];
var deliveryRequests = [];

function merchantOnStart()
{
	//pontyExclude.forEach(x => { buyFromPontyList.splice(buyFromPontyList.indexOf(x), 1) });
	//merchantItems.forEach(x => { itemsToHoldOnTo.push(x) });
	enableVendorMode();
}

function merchantSkills(){
	
	// specialParty();

	if(is_moving(character) || smart.moving || deliveryMode)
	{
		return;
	}

	if(vendorMode){
	sellTrash();
	tidyInventory();
	merchantsLuck();
	buyCheapStuff();
	upgradeItems();
	buyScrolls();
	// buyVendorUpgrade();
	pontyPurchase();
	exchangeGems();


	
	//compound process
	if(findTriple(0)) compoundItems(0);
	if(findTriple(1)) compoundItems(1);
	if(findTriple(2)) compoundItems(2);
	// if(findTriple(3)) compoundItems(3);

	//relocateItems();
	};

	if (new Date().getMinutes() === 00 || new Date().getMinutes() === 30)
		{
			depositInventoryAtBank();
		}


}
function isBusy()
{
	return returningToTown || deliveryMode || banking || exchangeMode || character.q.upgrade || character.q.compound;
}

function enableVendorMode()
{
	if (returningToTown || deliveryMode || banking)
	{
		return;
	}

	log("Merchant returning to vendor mode.");

	if (!isInTown())
	{
		goBackToTown();
	}
	else
	{
		smart_move(merchantStandCoords, () =>
		{
			log("Merchant entered vendor mode.");
			log("Crafting Mode: " + craftingOn);
			parent.open_merchant(locate_item("stand0"));
			vendorMode = true;
		});
	}
}

function disableVendorMode()
{
	log("Merchant exited vendor mode.");

	parent.close_merchant();
	vendorMode = false;
}

function buyPotions(){
	let mPotions = quantity(mPot);
	let	hPotions = quantity(hPot);

	if(mPotions < mPotionThreshold || hPotions < hPotionThreshold){

		if(mPotions < mPotionThreshold) buy_with_gold(mPot, mPotionThreshold - mPotions + mPotionThreshold);
		if(hPotions < hPotionThreshold) buy_with_gold(hPot, hPotionThreshold - hPotions + hPotionThreshold);
		log("Bought Potions!");
	}
}


function tidyInventory()
{
	if (character.q.upgrade || character.q.compound)
	{
		return;
	}

	let slotToMove = -1;
	let lastEmptySlot = -1;
	for (let i = 0; i < character.items.length; i++)
	{
		let item = character.items[i];

		if (item && item.name == "placeholder")
		{
			continue;
		}

		if (item && slotToMove == -1)
		{
			slotToMove = i;
		}
		else if (slotToMove != -1 && !item)
		{
			lastEmptySlot = i;
		}
	}

	if (lastEmptySlot > 0)
	{
		swap(slotToMove, lastEmptySlot);
	}
}

function buyScrolls(){
	if(quantity("cscroll0") <= minNormalCompoundScrolls){
		buy("cscroll0", (minNormalCompoundScrolls - quantity("cscroll0")));
		log("Bought Normal Compound Scrolls!");
	}
	if(quantity("cscroll1") <= minRareCompoundScrolls){
		buy("cscroll1", (minRareCompoundScrolls - quantity("cscroll1")));
		log("Bought Rare Compound Scrolls!");
	}
	if(quantity("scroll0") <= minNormalUpgradeScrolls){
		buy("scroll0", (minNormalUpgradeScrolls - quantity("scroll0")));
		log("Bought Normal Upgrade Scrolls!");
	}
	if(quantity("scroll1") <= minRareUpgradeScrolls){
		buy("scroll1", (minRareUpgradeScrolls - quantity("scroll1")));
		log("Bought Rare Upgrade Scrolls!");
	}
}

function buyVendorUpgrade(){
	
	for(let i = 0; i < vendorUpgradeList.length; i++){
		if((character.gold < 350000) || character.items.filter(element => element).length > inventoryMax || quantity("scroll1") < 1) return;
		buy(vendorUpgradeList[i], 1);
		log("Bought " + vendorUpgradeList[i]);
	}
}

function sellTrash(){
	
	for(let i = 0; i <= 41; i++){
		if(character.items[i]
		   && (trashName.indexOf(character.items[i].name) !== -1)
		   && (!item_grade(character.items[i]) > 0)
		   && (character.items[i].level == 0)
		   && (!character.items[i].p)) 
		{
			log("Merchant is unloading trash: " + character.items[i].name);
			// if(G.items[character.items[i].name].type === "material")
			// {
			// 	sell(i, character.items[i].q);
			// }
			// else
			// {
				sell(i, character.items[i]);
			// }
		}
	}		
}

function exchangeGems()
{
	for(let i = 0; i <= 41; i++){
		if(character.items[i]
			&& (character.items[i].q > 1)
			&& (G.items[character.items[i].name].type === "gem"
		//   || G.items[character.items[i].name].type === "box"
		  )){
			exchange(i);
			// log("Item Exchanged!");
		}
	}
}

function depositMoney()
{
	bank_deposit(character.gold - reserveMoney);
	log("Money deposited! Money in Pocket: " + character.gold);
}

function depositItems()
{
	for(let i = 41; i > 0; i--){
        if(!character.items[i]) return;
        if(character.items[i] && (character.items[i].level && character.items[i].level >= sellItemLevel) || (item_grade(character.items[i]) > 0 || G.items[character.items[i].name].type === "material" || specialItems.includes(character.items[i].name)))
			{
				bank_store(i);
				log("Item Stored in bank!");
			}
	}
}

function upgradeItems()
{
	if(character.q.upgrade || (quantity("scroll0") < 1) || (quantity("scroll1") < 1))
	{
		//Already combining something!
		return;
	}
	
	for(let i = 0; i <= 41; i++)
	{
		if(character.items[i] && (character.items[i].level < upgradeItemLevel1) && (!character.items[i].p) && upgradeItemList.includes(character.items[i].name) && item_grade(character.items[i]) < 1 )
		{
			log("Upgrade Started for item " + G.items[character.items[i].name].name + " +" + character.items[i].level);
			upgrade(i,locate_item("scroll0"));
			return;
		}
		else if(character.items[i] && (character.items[i].level < upgradeItemLevel2) && (!character.items[i].p) && upgradeItemList.includes(character.items[i].name))
		{
			log("Upgrade Started for item " + G.items[character.items[i].name].name + " +" + character.items[i].level);
			upgrade(i,locate_item("scroll1"));
			return;
		}
	}
}

function compoundItems(level){
	if(character.q.upgrade){
		//log("Already combining something!");
		return;
	}
	let triple = findTriple(level);
	if(triple && triple.length === 3 && !character.q.compound && level === 2)
	{
		compound(triple[0],triple[1],triple[2],locate_item("cscroll1"));
		log("Compounded an Item!");
	}

	else if(triple && triple.length === 3 && !character.q.compound)
	{
		compound(triple[0],triple[1],triple[2],locate_item("cscroll0"));
		log("Compounded an Item!");
	}
}

function findTriple(level){
	let compoundTriple = [];
	for(let i = 0; i <= 41; i++){
		if(character.items[i]
			   && character.items[i].level === level
			   && (!character.items[i].p)
		   	//Weapons can't be compounded. If item has attack attr, no compound
			 //&& !G.items[character.items[i].name].attack
			 && G.items[character.items[i].name].compound
			 ){
			for(let j = i + 1; j <= 41; j++){
				if(character.items[j]
				   && character.items[j].name === character.items[i].name
				   && (!character.items[i].p)
				   && character.items[j].level === level){
					for(let k = j + 1; k <= 41; k++){
						if(character.items[k]
						   && character.items[k].name === character.items[j].name
						   && (!character.items[i].p)
						   && character.items[k].level === level){
							// log(" Slot i: "  + i + " item: " + character.items[i].name + " Slot j: "  + j + " item: " + character.items[j].name + " Slot k: "  + k + " item: " + character.items[k].name )
							compoundTriple.push(i, j, k);
							return compoundTriple
						}
					}
				}
			}
		}
	}
}

function findEmptyTradeSlots(){
	let tradeSlots = Object.keys(character.slots).filter(tradeSlot => tradeSlot.includes("trade"));

	//Returns i + 1 because character.slots is 0-indexed,
	//but Trate-Slots start with 1 NOT ZERO
	for (let i = 0; i < tradeSlots.length; i++){
		if(!character.slots[tradeSlots[i]]) return i + 1;
	}
}

function merchantsLuck(name){
	if(name && character.mp > (character.max_mp * manaReserve) && character.mp > G.skills.mluck.mp && can_use("mluck")){
		use_skill("mluck", name);
		log("Buffing: " + name);
	}
}

function buyCheapStuff(){
	for (i in parent.entities){
		let otherPlayer = parent.entities[i];
		if(otherPlayer.player
		  && otherPlayer.ctype === "merchant"
		  && otherPlayer.slots
		  && distance(character, otherPlayer) < G.skills.mluck.range){

			let tradeSlots = Object.keys(otherPlayer.slots).filter(tradeSlot => tradeSlot.includes("trade"));
			tradeSlots.forEach(tradeSlot => {
				if(otherPlayer.slots[tradeSlot]
				   && otherPlayer.slots[tradeSlot].price < item_value(otherPlayer.slots[tradeSlot])
				   && character.gold > otherPlayer.slots[tradeSlot].price
				   && otherPlayer.slots[tradeSlot].b == "false"){
					trade_buy(otherPlayer, tradeSlot);
					log("Bought " + otherPlayer.slots[tradeSlot].name + " from player: " + otherPlayer.name)
				}				
			});				  
		}
	}
}

function openMerchantStand(){
//Go to the market and sell things
	if(character.map != "main"){
		smart_move({to:"main"}, () => {
			smart_move({to:"town"}, () => {
				smart_move({x: character.x  + 10, y: character.y - 50}, () => {
					//parent.socket.emit("merchant",{num:41});
					parent.open_merchant(41);
				});
			});
		});
	}
	else{
		smart_move({to:"town"}, () => {
			smart_move({x: character.x  + 45, y: character.y - 70}, () => {
				//parent.socket.emit("merchant",{num:41});
				parent.open_merchant(41);
			});
		});
	}
}

function merchant_on_cm(sender, data)
{
	if (data.message == "buyPots")
	{
		if (deliveryRequests.find((x) => { if (x.request == "potions" && x.sender == sender) return x; }))
		{
			log("Already have potion request from " + sender);
			return;
		}

		log("Recieved potion request from " + sender);
		deliveryRequests.push({ request: "potions", sender: sender, shipment: null, hPots: data.hPots, mPots: data.mPots, x: data.x, y: data.y, map: data.map });
	}
	else if (data.message == "mluck")
	{
		if (deliveryRequests.find((x) => { if (x.request == "mluck") return x; }))
		{
			log("Already have mluck request.");
			return;
		}

		log("Recieved mluck request from " + sender);
		deliveryRequests.push({ request: "mluck", sender: sender, x: data.x, y: data.y, map: data.map });
	}
	else if (data.message == "thanks")
	{
		log("Successful delivery confirmation from " + sender);

		if (data.request == "mluck")
		{
			for (let i = deliveryRequests.length - 1; i >= 0; i--)
			{
				if (deliveryRequests[i].request == "mluck")
				{
					deliveryRequests.splice(i, 1);
				}
			}
		}
		else
		{
			deliveryRequests.splice(deliveryRequests.indexOf(x => x.sender == sender && x.request == data.request), 1);
		}
	}


	//	this should remain the last check
	if (data.message == "deliveryConfirmation")
	{
		if (!data.confirm)
		{
			return;
		}

		for (let i = deliveryRequests.length - 1; i >= 0; i--)
		{
			if (deliveryRequests[i].sender == sender)
			{
				log("Cleaning up delivery list...");
				deliveryRequests.splice(i, 1);
			}
		}

		for (let i = deliveryShipments.length - 1; i >= 0; i--)
		{
			if (deliveryShipments[i].name == sender)
			{
				log("Cleaning up delivery list...");
				deliveryShipments.splice(i, 1);
			}
		}
	}
	
}

function checkRequests()
{
	if (deliveryRequests.length == 0)
	{
		deliveryMode = false;
		if ( !isInTown )
		{	
			goBackToTown();
		}
		return;
	}

	if (deliveryRequests.length > 0)
	{
		deliveryMode = true;
		disableVendorMode();

		for (let i = 0; i < deliveryRequests.length; i++)
		{
			//	go buy potions
			if (deliveryRequests[i].request == "potions" && !deliveryRequests[i].shipment)
			{
				buyPotionsFor(deliveryRequests[i].sender, deliveryRequests[i].hPots, deliveryRequests[i].mPots);
			}
			//	deliver to recipient
			else if (deliveryRequests[i].shipment || deliveryRequests[i].request == "mluck")
			{
				let recipient = deliveryRequests[i];
				
				if (recipient && !is_moving(character))
				{
					moveToRequest(recipient);
				}
				// else
				// {
				// 	requestTeleport();
				// }
			}
		}
	}
}

function getShipmentFor(name)
{
	if (deliveryShipments.length == 0)
	{
		return null;
	}

	for (let i = 0; i < deliveryShipments.length; i++)
	{
		if (deliveryShipments[i].name == name)
		{
			return deliveryShipments[i];
		}
	}

	return null;
}

function standCheck()
{
	if (is_moving(character) || smart.moving || returningToTown)
	{
		if (character.stand)
		{
			parent.close_merchant();
		}
	}
	else if (vendorMode)
	{
		parent.open_merchant(locate_item("stand0"));
	}
}

function buyPotionsFor(name, healthPots, manaPots)
{
	let request = deliveryRequests.find((x) =>
	{
		if (x.sender == name && x.request == "potions")
		{
			return x;
		}
	});

	if (!request)
	{
		log("Attempting to buy potions but don't have request");
		return;
	}

	if (getEmptyInventorySlotCount() < 8)
	{
		sellTrash();

		if (getEmptyInventorySlotCount() < 8 && (!hasUpgradableItems() && craftingOn))
		{
			log("Need inventory space to buy potions, going to bank.");
			disableVendorMode();
			depositInventoryAtBank();
			return;
		}
		else
		{
			log("Continuing to craft in order to free inventory space.");
		}
	}

	if (!isInTown())
	{
		log("Returning to buy potions...");
		goBackToTown();
		return;
	}

	let h = healthPots - quantity(hPot);
	let m = manaPots - quantity(mPot);

	if (h > 0)
	{
		buy_with_gold(hPot, h);
		log("Buying " + healthPots + " health potions");
	}

	if (m > 0)
	{
		buy_with_gold(mPot, m);
		log("Buying " + manaPots + " mana potions");
	}

	let potionShipment = { name: name, hPots: healthPots, mPots: manaPots };
	deliveryShipments.push(potionShipment);
	request.shipment = potionShipment;
}

function deliverItems(shipmentToDeliver)
{
	if (shipmentToDeliver.hPots != null || shipmentToDeliver.mPots != null)
	{
		deliverPotions(shipmentToDeliver);
	}
	else if (shipmentToDeliver.elixir != null)
	{
		deliverElixir(shipmentToDeliver);
	}
}

function deliverPotions(shipment)
{
	let recipient = parent.entities[shipment.name];
	if (distance(recipient, character) < 200)
	{
		log("Delivering potions to " + shipment.name);
		let index = deliveryShipments.indexOf(shipment);
		deliveryShipments.splice(index, 1);
		send_item(shipment.name, locate_item(hPot), shipment.hPots);
		send_item(shipment.name, locate_item(mPot), shipment.mPots);
		//send_item(shipment.name, locate_item(hPot), quantity(hPot));
		//send_item(shipment.name, locate_item(mPot), quantity(mPot));
	}
	else
	{
		approachTarget(recipient);
	}
}


function moveToRequest(request)
{
	if (!request)
	{
		return;
	}
	else
	{
		if ( character.map !== request.map )
		{
			smart_move({ to: request.map }, () => 
				{
					smart_move({ x: request.x, y: request.y });
				}
			);
		}
		else
		{
			smart_move({ x: request.x, y: request.y });
		}
	}
}


// function merchantAuto(target)
// {
 	
// 	if (!isBusy())
// 	{
// 		if (isInTown() && !vendorMode)
// 		{
// 			enableVendorMode();
// 		}
// 		else if (!isInTown())
// 		{
// 			goBackToTown();
// 		}
// 	}
	
// /* 
// 	//	keep magic luck on yourself
// 	if (!checkMluck(character) && !is_on_cooldown("mluck"))
// 	{
// 		log("mlucking self");
// 		use_skill("mluck", character);
// 		reduce_cooldown("mluck", character.ping);
// 	} 

//  */
// 	for (let other in parent.entities)
// 	{
// 		let isPartyMember = parent.party_list.includes(other);
// 		let friendlyTarget = parent.entities[other];

// 		if (!friendlyTarget.player || friendlyTarget.npc)
// 		{
// 			continue;
// 		}

// 		if (isPartyMember)
// 		{
// 			if (distance(friendlyTarget, character) < 200)
// 			{
// 				let shipment = getShipmentFor(friendlyTarget.name);

// 				if (shipment)
// 				{
// 					deliverItems(shipment);
// 				}
// 				else if (!checkMluck(friendlyTarget))
// 				{
// 					log("Giving mluck to " + friendlyTarget.name);
// 					use_skill("mluck", friendlyTarget);
// 					reduce_cooldown("mluck", character.ping);
// 				}
// 			}
// 			else if (deliveryMode && !returningToTown && deliveryRequests.length > 0)
// 			{
// 				log("Moving closer to recipient.");
// 				approachTarget(friendlyTarget);
// 			}
// 		}
// 		else if (friendlyTarget)
// 		{
// 			//	mluck others but some safety checks to make sure you don't spam it
// 			if (!is_on_cooldown("mluck") && !checkMluck(friendlyTarget) && is_in_range(friendlyTarget, "mluck") && !friendlyTarget.afk && !friendlyTarget.stand && character.mp > character.max_mp * 0.5)
// 			{
// 				log("Giving mluck to " + friendlyTarget.name);
// 				use_skill("mluck", friendlyTarget);
// 				reduce_cooldown("mluck", character.ping);
// 			}
// 		}
// 	}
// }

function merchantAuto(target)
{
	standCheck();
	if (!isBusy())
	{
		if (isInTown() && !vendorMode)
		{
			enableVendorMode();
		}
		else if (!isInTown())
		{
			goBackToTown();
		}
	}
	
	//	keep magic luck on yourself
	if (!checkMluck(character) && !is_on_cooldown("mluck"))
	{
		use_skill("mluck", character);
		reduce_cooldown("mluck", character.ping);
	}

	for(let p in parent.entities)
	{
		let isPartyMember = whiteList.includes(p);
		let friendlyTarget = parent.entities[p];

		if (!friendlyTarget.player || friendlyTarget.npc)
		{
			continue;
		}

		if (isPartyMember && friendlyTarget)
		{
			if (distance(friendlyTarget, character) < 100)
			{
				let shipment = getShipmentFor(friendlyTarget.name);

				if (shipment)
				{
					deliverItems(shipment);
				}
				else if (!checkMluck(friendlyTarget))
				{
					log("Giving mluck to " + friendlyTarget.name);
					use_skill("mluck", friendlyTarget);
					reduce_cooldown("mluck", character.ping);
				}
			}
			else if (deliveryMode && !smart.moving && !returningToTown && deliveryRequests.length > 0 && friendlyTarget.name === deliveryRequests[0].sender)
			{
				log("Moving closer to recipient.");
				smart_move({x:friendlyTarget.x, y:friendlyTarget.y});
			}
		}
		else if (friendlyTarget)
		{
			//	mluck others but some safety checks to make sure you don't spam it
			if (!is_on_cooldown("mluck") && !checkMluck(friendlyTarget) && is_in_range(friendlyTarget, "mluck") && !friendlyTarget.afk && !friendlyTarget.stand && character.mp > character.max_mp * 0.5)
			{
				log("Giving mluck to " + friendlyTarget.name);
				use_skill("mluck", friendlyTarget);
				reduce_cooldown("mluck", character.ping);
			}
		}
	}
}

function specialParty()
{
	if ( !parent.party_list.includes("Maela") )
	{
		leave_party();
	}
}


// Adapted From Lotus

function pontyPurchase()
{
	// parent.socket.emit("secondhands");
    let itemsToBuy = buyFromPonty;
    parent.socket.once("secondhands", function (data)
    {    
        for (let pontyItem of data)
        {
            let buy = false;
            if (pontyItem.p)
            {
                log("Found shiny ponty item : " + G.items[pontyItem.name].name);
                buy = true;
            }

            if ( (buyFromPonty.includes(pontyItem.name)) && (!trashName.includes(pontyItem.name)) )
            {
            //     if (upgradeItemList.includes(pontyItem.name) || combineItemList.includes(pontyItem.name))
            //     {
            //         if (upgradeItemList.includes(pontyItem.name) && (pontyItem.level <= upgradeItemLevel2))
            //         {
            //             buy = true;
            //             log("found upgrade item at ponty " + pontyItem.name)
            //         }
            //         else if (combineItemList.includes(pontyItem.name) && (pontyItem.level <= 3))
            //         {
            //             buy = true;
            //             log("found compound item at ponty " + pontyItem.name)
            //         }
            //     }
            // }
                
            // else
            // {
                buy = true;
            }

            if (buy)
            {
                log("Buying " + G.items[pontyItem.name].name + " from Ponty!");
                parent.socket.emit("sbuy", { "rid": pontyItem.rid })
            }
            
        }
    });

    parent.socket.emit("secondhands");
}
