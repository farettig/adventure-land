function merchantSkills(){
	
	if(character.map != "main") smart_move({to:"main"});

	if (merchantStatus.idle){
		sellTrash();
		tidyInventory();
		merchantsLuck();
		buyCheapStuff();
		upgradeItems();
		// buyVendorUpgrade();
	
		//searchItems2bSold Returns Array SLOTS. Therefor it can return ZEROES
		//So we have to specifically look for UNDEFINED
		//if(searchItems2bSold(sellItemLevel) !== undefined && findEmptyTradeSlots() !== undefined) sellItems(sellItemLevel, profitMargin);

		
		//compound process
		if(findTriple(0)) compoundItems(0);
		if(findTriple(1)) compoundItems(1);
		if(findTriple(2)) compoundItems(2);
		if(findTriple(3)) compoundItems(3);

		relocateItems();

		// walk around town some time. Stretch your legs
		if (new Date().getMinutes() === 00 
		|| new Date().getMinutes() === 15 
		|| new Date().getMinutes() === 30 
		|| new Date().getMinutes() === 45){
			//	Close merchant Stand
			parent.close_merchant(41);
			//	Move to scrolls and buy them
			smart_move({to:"scrolls"}, () => {
				buyScrolls();
				//Exchange gems
				smart_move({to:"exchange"}, () => {
					exchangeGems();
					//Deposit Money
					smart_move({to:"bank"}, () => {
						depositMoney();
						depositItems();
						//Go to the market and sell things
						smart_move({to:"town"}, () => {
							openMerchantStand();
						});
					});
				});
			});
		}
	}
}



function buyPotions(){
	let mPotions = quantity(mPot);
	let	hPotions = quantity(hPot);

	if(mPotions < mPotionThreshold || hPotions < hPotionThreshold){

		if(mPotions < mPotionThreshold) buy_with_gold("mpot0", mPotionThreshold - mPotions + mPotionThreshold);
		if(hPotions < hPotionThreshold) buy_with_gold("hpot0", hPotionThreshold - hPotions + hPotionThreshold);
		log("Bought Potions!");
	}
}

function transferPotions(name, type){
	
	if(character.items[locate_item(type)]){
		send_item(name, locate_item(type), quantity(type));
		game_log("Delivered Potions to " + name);
	}
	

}

function tidyInventory(){

	for(let i = 34; i > 0; i--){
		if(character.items[i] && (character.items[i].name === hPot || character.items[i].name === mPot)){
			relocateItems();
			return;
		}
		if(character.items[i] && !character.items[i-1]){
			swap(i, i-1)
			log("Tidying Inventory...");
		}
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
		   && trashName.indexOf(character.items[i].name) !== -1
		   && !item_grade(character.items[i]) > 0) {
			log("Merchant is unloading trash: " + character.items[i].name);
			if(G.items[character.items[i].name].type === "material"){
				sell(i, character.items[i].q);
			}else{
				sell(i, character.items[i]);
			}
		}
	}		
}

function exchangeGems(){
	for(let i = 0; i <= 41; i++){
		if(character.items[i]
		  && (G.items[character.items[i].name].type === "gem"
		  || G.items[character.items[i].name].type === "box")){
			exchange(i);
			log("Item Exchanged!");
		}
	}
}

function depositMoney(){	
	bank_deposit(character.gold - reserveMoney);
	log("Money deposited! Money in Pocket: " + character.gold);
}

function depositItems(){
	for(let i = 0; i <= 41; i++){
        if(!character.items[i]) return;
        if(character.items[i] 
		&& (character.items[i].level && character.items[i].level >= sellItemLevel)
		|| (item_grade(character.items[i]) > 0 || G.items[character.items[i].name].type === "material" || specialItems.includes(character.items[i].name)))
			{
				bank_store(i);
				log("Item Stored in bank!");
			}
	}
}


function upgradeItems(){
	if(character.q.upgrade || (quantity("scroll0") < 1) || (quantity("scroll1") < 1)){
		//log("Already combining something!");
		return;
	}
	for(let i = 0; i <= 41; i++){
		if(character.items[i]
		&& (character.items[i].level < upgradeItemLevel1)
		&& enchantItemList.includes(character.items[i].name)
		&& item_grade(character.items[i]) < 1 ){
			log("Upgrade Started for item " + G.items[character.items[i].name].name + " +" + character.items[i].level);
			upgrade(i,locate_item("scroll0"));
			return;
			
		}else{
			if(character.items[i]
				&& (character.items[i].level < upgradeItemLevel2)
				&& enchantItemList.includes(character.items[i].name)){
					log("Upgrade Started for item " + G.items[character.items[i].name].name + " +" + character.items[i].level);
					upgrade(i,locate_item("scroll1"));
					return;

			}
		}
	}

}


function compoundItems(level){
	if(character.q.upgrade){
		//log("Already combining something!");
		return;
	}
	let triple = findTriple(level);
	if(triple
	   && triple.length === 3
	   && !character.q.compound){
		compound(triple[0],triple[1],triple[2],locate_item("cscroll0"));
		log("Compounded an Item!");
	}
}


function findTriple(level){
	let compoundTriple = [];
	for(let i = 0; i <= 41; i++){
		if(character.items[i]
		   	&& character.items[i].level === level
		   	//Weapons can't be compounded. If item has attack attr, no compound
			 //&& !G.items[character.items[i].name].attack
			 && G.items[character.items[i].name].compound
			 ){
			for(let j = i + 1; j <= 41; j++){
				if(character.items[j]
				   && character.items[j].name === character.items[i].name
				   && character.items[j].level === level){
					for(let k = j + 1; k <= 41; k++){
						if(character.items[k]
						   && character.items[k].name === character.items[j].name
						   && character.items[k].level === level){
							log(" Slot i: "  + i + " item: " + character.items[i].name + " Slot j: "  + j + " item: " + character.items[j].name + " Slot k: "  + k + " item: " + character.items[k].name )
							compoundTriple.push(i, j, k);
							return compoundTriple
						}
					}
				}
			}
		}
	}
}


/* function searchItems2bSold(sellItemLevel = 2){
	for (let i = 0; i <= 41; i++){
		if(character.items[i]
		   && character.items[i].level === sellItemLevel) return i;
	}
} 

function sellItems(sellItemLevel = 2, profitMargin = 2){
	trade(searchItems2bSold(sellItemLevel), findEmptyTradeSlots(),  item_value(character.items[searchItems2bSold(sellItemLevel)]) * profitMargin);
} */

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

