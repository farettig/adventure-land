
/*
This Gold meter was provided by Spadar's Github
https://github.com/Spadar/AdventureLand/blob/master/GUI/GoldMeter.js
*/

var startTime = new Date();
var sumGold = 0;

setInterval(function() {
  update_goldmeter();
}, 100);

function init_goldmeter() {
  let $ = parent.$;
  let brc = $('#bottomrightcorner');

  brc.find('#goldtimer').remove();

  let xpt_container = $('<div id="goldtimer"></div>').css({
    fontSize: '28px',
    color: 'white',
    textAlign: 'center',
    display: 'table',
    overflow: 'hidden',
    marginBottom: '-5px',
	width: "100%"
  });
	
  //vertical centering in css is fun
  let xptimer = $('<div id="goldtimercontent"></div>')
    .css({
      display: 'table-cell',
      verticalAlign: 'middle'
    })
    .html("")
    .appendTo(xpt_container);

  brc.children().first().after(xpt_container);
}



function updateGoldTimerList()
{
	let $ = parent.$;
	
	var gold = getGold();
	
	var goldString = "<div>" + gold + " Gold/Hr" + "</div>"; 
	
	$('#' + "goldtimercontent").html(goldString).css({
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    height: '34px',
    lineHeight: '34px',
    fontSize: '30px',
    color: '#FFD700',
    textAlign: 'center',
  });
}


function update_goldmeter() {
	updateGoldTimerList();
}


init_goldmeter()

function getGold()
{
	var elapsed = new Date() - startTime;
	
	var goldPerSecond = parseFloat(Math.round((sumGold/(elapsed/1000)) * 100) / 100);
	
	return parseInt(goldPerSecond * 60 * 60).toLocaleString('en');
}

//Clean out an pre-existing listeners
if (parent.prev_handlersgoldmeter) {
    for (let [event, handler] of parent.prev_handlersgoldmeter) {
      parent.socket.removeListener(event, handler);
    }
}

parent.prev_handlersgoldmeter = [];

//handler pattern shamelessly stolen from JourneyOver
function register_goldmeterhandler(event, handler) 
{
    parent.prev_handlersgoldmeter.push([event, handler]);
    parent.socket.on(event, handler);
};

function goldMeterGameResponseHandler(event)
{
	if(event.response == "gold_received")
	{
		sumGold += event.gold;
	}
}

function goldMeterGameLogHandler(event)
{
	if(event.color == "gold")
	{
		var gold = parseInt(event.message.replace(" gold", "").replace(",", ""));
		
		sumGold += gold;
	}
}


register_goldmeterhandler("game_log", goldMeterGameLogHandler);
register_goldmeterhandler("game_response", goldMeterGameResponseHandler);



/*
This DPS meter was provided by Spadar's Github
https://github.com/Spadar/AdventureLand/blob/master/GUI/DPSMeter.js
*/


var dpsInterval = 10000;
var damageSums = {};
var damageLog = [];

setInterval(function() {
  update_dpsmeter();
}, 100);
function init_dpsmeter() {

  let $ = parent.$;
  let brc = $('#bottomrightcorner');

  brc.find('#dpsmeter').remove();

  let dps_container = $('<div id="dpsmeter"></div>').css({
    fontSize: '28px',
    color: 'white',
    textAlign: 'center',
    display: 'table',
    overflow: 'hidden',
    marginBottom: '-5px',
	width: "100%"
  });
	
  //vertical centering in css is fun
  let dpsmeter = $('<div id="dpsmetercontent"></div>')
    .css({
      //display: 'table-cell',
      verticalAlign: 'middle'
    })
    .html("")
    .appendTo(dps_container);

  brc.children().first().after(dps_container);
}



function updateTimerList()
{
	let $ = parent.$;
	
	var listString = '<table style="border-style: solid;" border="5px" bgcolor="black" align="right" cellpadding="5"><tr align="center"><td colspan="2">Damage Meter</td></tr><tr align="center"><td>Name</td><td>DPS</td></tr>';
	
	if(parent.party_list != null && character.party != null)
	{
		for(id in parent.party_list)
		{
			var partyMember = parent.party_list[id];
			var dps = getDPS(partyMember);
			listString = listString + '<tr align="left"><td align="center">' + partyMember + '</td><td>' + dps + '</td></tr>';
		}
	}
	else
	{
		var dps = getDPS(character.name);
		listString = listString + '<tr align="left"><td align="center">' + character.name + '</td><td>' + dps + '</td></tr>';
	}
	
	if(parent.party_list != null && character.party != null)
	{
		var dps = getTotalDPS();
		listString = listString + '<tr align="left"><td>' + "Total" + '</td><td>' + dps + '</td></tr>';
	}
	
	$('#' + "dpsmetercontent").html(listString);
}


function update_dpsmeter() {
	updateTimerList();
}


init_dpsmeter(5)

function getDPS(partyMember)
{
	var entry = damageSums[partyMember];
	var dps = 0;
	
	if(entry != null)
	{
		var elapsed = new Date() - entry.startTime;

		dps = parseFloat(Math.round((entry.sumDamage/(elapsed/1000)) * 100) / 100).toFixed(2);
	}
	return dps;
}

function getTotalDPS()
{	
	var minStart;
	var sumDamage  = 0;
	var dps = 0;
	for(var id in damageSums)
	{
		var entry = damageSums[id];
		
		if(minStart == null || entry.startTime < minStart)
		{
			minStart = entry.startTime;
		}
		
		sumDamage += entry.sumDamage;
	}
	
	if(minStart != null)
	{
		var elapsed = new Date() - minStart;

		dps = parseFloat(Math.round((sumDamage/(elapsed/1000)) * 100) / 100).toFixed(2);
	}
	
	return dps;
}

//Clean out an pre-existing listeners
if (parent.prev_handlersdpsmeter) {
    for (let [event, handler] of parent.prev_handlersdpsmeter) {
      parent.socket.removeListener(event, handler);
    }
}

parent.prev_handlersdpsmeter = [];

//handler pattern shamelessly stolen from JourneyOver
function register_dpsmeterhandler(event, handler) 
{
    parent.prev_handlersdpsmeter.push([event, handler]);
    parent.socket.on(event, handler);
};

function dpsmeterHitHandler(event)
{
	if(parent != null)
	{
		var attacker = event.hid;
		var attacked = event.id;

		var attackerEntity = parent.entities[attacker];
		
		
		
		if(attacker == character.name)
		{
			attackerEntity = character;
		}
		
		if((attackerEntity.party != null || attacker == character.name) || attackerEntity.party == character.party)
		{
			if(event.damage != null)
			{
				var attackerEntry = damageSums[attacker];
				
				if(attackerEntry == null)
				{
					var entry = {};
					entry.startTime = new Date();
					entry.sumDamage = 0;
					damageSums[attacker] = entry;
					attackerEntry = entry;
				}
				
				attackerEntry.sumDamage += event.damage;
				
				damageSums[attacker] = attackerEntry;
			}
		}
	}
}


register_dpsmeterhandler("hit", dpsmeterHitHandler);

/*
This Party Meter was provided by Spadar's Github
https://github.com/Spadar/AdventureLand/blob/master/GUI/PartyShare.js
*/

function new_render_party() {
    var b = "";
    for (var a in parent.party) {
        var c = parent.party[a];
        b += " <div class='gamebutton' style='padding: 6px 8px 6px 8px; font-size: 24px; line-height: 18px' onclick='party_click(\"" + a + "\")'>";
        b += parent.sprite(c.skin, {
            cx: c.cx || [],
            rip: c.rip
        });
        if (c.rip) {
            b += "<div style='color:gray; margin-top: 1px'>RIP</div>"
        } else {
            b += "<div style='margin-top: 1px'>" + a.substr(0, 3).toUpperCase() + "</div>"
        }
		b += "<div style='margin-top: 1px'>" + (c.share*100).toFixed(0) + "%</div>"
        b += "</div>"
    }
    parent.$("#newparty").html(b);
    if (!parent.party_list.length) {
        parent.$("#newparty").hide()
    } else {
        parent.$("#newparty").show()
    }
}
parent.render_party = new_render_party;

setInterval(function(){
	new_render_party();
}, 1000);

