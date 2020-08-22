// For easier command management and simplier help command generation we use "command store".

import { Command } from "../classes/command";

// It allows us to get information about commands that bot provides, to do that we register them when we're importing the module.
import { Collection } from "discord.js";
import logger from "./logger";
import chalk from "chalk";

const commands = new Collection();

export default {
	getByCategory(category: string) {
		return commands.filter((command: Command) => category === command.settings.category);
	},
	getCategories() {
		const categories: Array<string> = [];
		commands.forEach((command: Command) => {
			if (categories.indexOf(command.settings.category) > -1) return;
			else categories.push(command.settings.category);
		});
		return categories.sort((a, b) => a.localeCompare(b)); 
	},
	/**
	 * Adds a new command information to the command store.
	 *
	 * @param {{command: string, category: string, description: string, aliases: ?Array, onLoad: Function}} data - Information that shared in command collection.
	 * @returns {object} - Commands object with registered command.
	 */
	add(command: Command) {
		if (command.settings.enabled == false) return logger.info(chalk.yellow(`A command module named '${chalk.green(command.settings.command)}' was disabled.`));

		logger.info(`A command '${chalk.green(command.settings.command)}' has been registered.`);
		return commands.set(command.settings.command, command);
	},
	commands,
};
