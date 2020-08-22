import commandStore from "../../utils/commandStore";
import * as Discord from "discord.js";
import { Command, CommandSettings } from "../../classes/command";
import { VK } from "vk-io";
import settings from "../../settings.json";

export default class extends Command {

	constructor() {
		super({
			command: "help",
			aliases: ["h"],
			category: "Global",
			description: "Helpful information about commands"
		});
	}

	onLoad(client: Discord.Client, message: Discord.Message, args: string[], vkAPI: VK) {
		const embed = new Discord.MessageEmbed()
			.setColor("#4680C2")
			.setTitle("List of available commands")
			.setTimestamp();

		commandStore.getCategories().forEach((category: string) => {
			let categoryCommands = "";
			commandStore.commands.forEach((command: Command, commandName: string) => {
				if (command.settings.category !== category) return;
				categoryCommands += `\`${settings.general.prefix + commandName}\` - ${command.settings.description}\n`;
			});
			embed.addField(category, categoryCommands);
		});

		message.reply(embed);
	}
};
