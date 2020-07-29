
function todaysLogName()
{
	let date = new Date();
	let month = date.getMonth() + 1;
	let day = date.getDate();
	let year = date.getFullYear();

	let name = "logs/" + month + "-" + day + "-" + year + ".txt";
	return name;
}

function logForTodayExists()
{
	let fs = require('fs');
	fs.readFile(todaysLogName(), (error, data) =>
	{
		if (error)
		{
			return false;
		}
	});

	return true;
}

function createNewLogFile()
{
	let fs = require('fs');
	let fileName = todaysLogName();
	fs.writeFile(fileName, "", (error) =>
	{
		if (error)
		{
			log(error);
		}

		log("Created new log file at " + fileName);
	});
}

function writeToLog(data)
{
	if (!logForTodayExists())
	{
		createNewLogFile();
	}

	let fs = require('fs');
	let write = "time=" + new Date().toLocaleTimeString() + " character=" + character.name + " " + data + "\n";

	fs.appendFile(todaysLogName(), write, (error) =>
	{
		if (error)
		{
			log(error);
			throw error;
		}
		else
		{
		// /	log(write);
		}
	});
}



//Clean out an pre-existing listeners
if (parent.prev_handler) 
{
	for (let [event, handler] of parent.prev_handler) 
	{
		parent.socket.removeListener(event, handler);
	}
}

parent.prev_handler = [];

//handler pattern shamelessly stolen from JourneyOver
function register_handler(event, handler) 
{
    parent.prev_handler.push([event, handler]);
    parent.socket.on(event, handler);
}

function upgradeHandler(event)
{
	
	if(event.p.failure || event.p.success)
	{
		let result;
		if (event.p.failure)
		{
			result = "Failure"
		}
		else if (event.p.success)
		{
			result = "Success"
		}
		let output = "[Upgrade] +" + event.p.level + " " + G.items[event.p.name].name + " with " + event.p.scroll + " - " + result +": " + event.p.nums[3]+event.p.nums[2]+"."+event.p.nums[1]+event.p.nums[0] + "% vs. "+ event.p.chance*100 + "%"
		console.log(output);
		log(output);
		writeToLog(output);
		
	}
}


register_handler("q_data", upgradeHandler);




//		disconnect logic from SpadarFaar		//
var disconnectHistory;
GetDisconnectHistory();
function GetDisconnectHistory(){
	disconnectHistory = JSON.parse(localStorage.getItem("Disconnect_Log:" + character.name));
	
	if(disconnectHistory == null)
	{
		disconnectHistory = [];
	}
}

function SaveDisconnect(){
	game_log("Saving Disconnect");
	var entry = {};
	entry.time = new Date();
	entry.reason = parent.window.disconnect_reason;
	disconnectHistory.push(entry);
	writeToLog("[DISCONNECT] " + entry.reason);
	
	localStorage.setItem("Disconnect_Log:" + character.name, JSON.stringify(disconnectHistory));
}


parent.disconnect = disconnect_override;

function disconnect_override() {
	SaveDisconnect();
    var a = "DISCONNECTED";
    var b = "Disconnected";
    parent.game_loaded = false;
    if (parent.window.disconnect_reason == "limits") {
        a = "REJECTED";
        parent.add_log("Oops. You exceeded the limitations.", "#83BDCF");
        parent.add_log("You can have 3 characters and one merchant online at most.", "#CF888A")
    } else {
        if (parent.window.disconnect_reason) {
            parent.add_log("Disconnect Reason: " + window.disconnect_reason, "gray")
        }
    }
    if (character && (parent.auto_reload == "on" || parent.auto_reload == "auto" && (character.stand || parent.code_run || 1))) {
        parent.auto_reload = true;
        parent.code_to_load = null;
        if (parent.code_run && parent.actual_code) {
            parent.code_to_load = parent.codemirror_render.getValue()
        }
        b = "Reloading";
        parent.add_log("Auto Reload Active", parent.colors.serious_red);
        parent.reload_state = "start"
    } else {
        if (parent.character_to_load) {
            parent.add_log("Retrying in 7500ms", "gray");
            setTimeout(function() {
                parent.location.reload(true)
            }, 7500)
        }
    }

    if (character) {
        parent.$("title").html(b + " - " + character.name)
    }
    if (parent.socket) {
        parent.socket = null,
        parent.socket.disconnect()
    }    
	if (parent.no_html) {
		parent.set_status("Disconnected");
        parent.$("#name").css("color", "red")
        parent.$("iframe").remove();
        
    } else {
		parent.$("body").append("<div id='disconnectpanel' style='position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; z-index: 999; background: rgba(0,0,0,0.85); text-align: center'><div onclick='refresh_page()' class='gamebutton clickable' style='margin-top: " + (parent.round(parent.height / 2) - 10) + "px'>" + a + "</div></div>");
		parent.$("iframe").remove();
    }
}