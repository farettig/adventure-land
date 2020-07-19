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


