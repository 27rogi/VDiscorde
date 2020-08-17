const { commands, getCategories } = require("../../utils/commandStore");
const Discord = require("discord.js");
const settings = require("../../settings.json");

module.exports = {
	aliases: ["h"],
	category: "General",
	command: "help",
	description: "Can be used when changing stuff",
	onLoad({ message }) {
		const embed = new Discord.MessageEmbed()
			.setColor("#4680C2")
			.setTitle("List of available commands")
			.setTimestamp();

		getCategories().forEach((category) => {
			let categoryCommands = "";
			commands.forEach((command, commandName) => {
				if (command.category !== category) return;
				categoryCommands += `\`${settings.general.prefix + commandName}\` - ${command.description}\n`;
			});
			embed.addField(category, categoryCommands);
		});

		message.reply(embed);
	},
};
