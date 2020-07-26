const fs = require("fs");
const settings = require("../settings.json");
const commandStore = require("../utils/commandStore");
const logger = require("../utils/logger");
const chalk = require("chalk");

// We have access to `client` and `vk` constants to add functionality to the bot.
module.exports = (client, vk) => {
	// This constant will store every file that exists in `/commands` folder.
	const commandFiles = fs.readdirSync(__dirname + "/commands").filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const commandModule = require(`./commands/${commandFile}`);

		if (!commandModule.command || !commandModule.run) return logger.error(`A command module named '${commandFile}' has wrong structure.`);
		else logger.info(`A command module named '${chalk.green(commandFile)}' has been registered.`);

		// For easier command management and simplier help command generation we use "command store".
		// It allows us to get information about commands that bot
		// provides, to do that we register them when importing module.
		commandStore.add(commandModule.category, commandModule.command, commandModule.aliases, commandModule.description, commandModule.permissions);

		client.on("message", (message) => {
			if (message.author.bot) return;
			if (!message.content.startsWith(settings.general["prefix"])) return;

			const command = message.content.split(settings.general["prefix"])[1].split(" ");
			if (command[0] === commandModule.command || commandModule.aliases.includes(command[0])) {
				// Providing access to the `message`, `client`, and `vk` constants for future processing.
				commandModule.run(message, client, vk);
			}
		});
	}

};
