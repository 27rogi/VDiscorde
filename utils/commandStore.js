// For easier command management and simplier help command generation we use "command store".
// It allows us to get information about commands that bot provides, to do that we register them when we're importing the module.
const { Collection } = require("discord.js");
const logger = require("./logger");
const chalk = require("chalk");

const commands = new Collection();

module.exports = {
	getByCategory(category) {
		return commands.filter(command => category === command.category);
	},
	getCategories() {
		const categories = [];
		commands.forEach((command) => {
			if (categories.indexOf(command.category) > -1) return;
			else categories.push(command.category);
		});
		return categories.sort((a, b) => a.localeCompare(b));
	},
	/**
	 * Adds a new command information to the command store.
	 *
	 * @param {{command: string, category: string, description: string, aliases: ?Array, onLoad: Function}} data - Information that shared in command collection.
	 * @returns {object} - Commands object with registered command.
	 */
	add(data) {
		if (typeof data !== "object") return logger.error(`Command ${chalk.yellow(data.command)} wasn't registered because no command data was provided!`);
		if (typeof data.onLoad !== "function") return logger.error(`Command ${chalk.yellow(data.command)} wasn't registered because it has no execution function!`);
		if (!data.category) return logger.error(`Command ${chalk.yellow(data.command)} wasn't registered because it has no category!`);
		if (!data.description) return logger.error(`Command ${chalk.yellow(data.command)} wasn't registered because it has no description!`);
		if (data.enabled == false) return logger.info(chalk.yellow(`A command module named '${chalk.green(data.command)}' was disabled.`));

		logger.info(`A command '${chalk.green(data.command)}' has been registered.`);
		return commands.set(data.command, data);
	},
	commands,
};
