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

		if (!commandModule.command && !commandModule.onLoad) return logger.error(`A command module named '${commandFile}' has wrong structure.`);

		// For easier command management and simplier help command generation we use "command store".
		// It allows us to get information about commands that bot
		// provides, to do that we register them when we're importing the module.
		commandStore.add(commandModule);
	}

	client.on("message", (message) => {
		if (message.author.bot) return;
		if (!message.content.startsWith(settings.general["prefix"])) return;

		const args = message.content.slice(settings.general["prefix"].length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();

		const command = commandStore.commands.get(commandName) || commandStore.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
		if (!command) return;

		if (typeof command.permissions == "object") {
			if (!message.guild.member(message.author).hasPermission(command.permissions)) return message.reply(`You don't have \`${command.permissions.join(", ")}\` permission(s) for that!`);
		}
		// Providing access to some instances inside the command to make it more flexible.
		// Using object as a command argument allows us to use destructurization to get only required instances.
		command.onLoad({ message: message, args: args, client: client, vkAPI: vk });

	});
};
