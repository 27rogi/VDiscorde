import * as fs from "fs";
import settings from "../settings.json";
import commandStore from "../utils/commandStore";
import logger from "../utils/logger";
import chalk from "chalk";

import * as Discord from "discord.js";
import { VK } from "vk-io";
import { CommandSettings, Command } from "../classes/command";
import { Module } from "../classes/module";

export default class Commands extends Module {

	constructor(client: Discord.Client, vkAPI: VK) {
		super(client, vkAPI);
	}

	execute() {
	// This constant will store every file that exists in `/commands` folder.
	const commandFiles = fs.readdirSync(process.cwd() + "/modules/commands").filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const commandModule: Promise<Command> = import(process.cwd() + `/modules/commands/${commandFile}`);
		commandModule.then((module: any) => {
			const command = new module.default();
			if (!command.settings.command && !command.onLoad) return logger.error(`A command module named '${commandFile}' has wrong structure.`);
			// For easier command management and simplier help command generation we use "command store".
			// It allows us to get information about commands that bot
			// provides, to do that we register them when we're importing the module.
			commandStore.add(command);
		}).catch((err) => {
			logger.error("Error occured while loading command: " + err);
		});
	}

	this.client.on("message", (message: Discord.Message) => {
		if (message.author.bot) return;
		if (!message.content.startsWith(settings.general["prefix"])) return;

		const args = message.content.slice(settings.general["prefix"].length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();

		const command: Command = (commandStore.commands.get(commandName) as Command) || (commandStore.commands.find((cmd: Command) => cmd.settings.aliases && cmd.settings.aliases.includes(commandName)) as Command);
		if (!command) return;

		if (typeof command.settings.permissions) {
			if (command.hasPermission(message.guild, message.author)) return message.reply(`You don't have \`${command.settings.permissions.toLocaleString()}\` permission(s) for that!`);
		}
		// Providing access to some instances inside the command to make it more flexible.
		// Using object as a command argument allows us to use destructurization to get only required instances.
		command.onLoad(this.client, message, args, this.vkAPI);

	});	
	}
};
