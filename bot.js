const settings = require("./settings.json");

const Discord = require("discord.js");
const fs = require("fs");
const logger = require("./utils/logger");
const chalk = require("chalk");
const { VK } = require("vk-io");

const client = new Discord.Client();
const vk = new VK({
	token: settings.general["tokenVK"],
});
const moduleFiles = fs.readdirSync("./modules").filter((file) => file.endsWith(".js"));

client.once("ready", async () => {
	// TODO: Find a better way for VK token validation.
	await vk.api.users.get({ user_ids: 1 }).catch((err) => {
		logger.info(err);
		process.exit(1);
	});

	for (const moduleFile of moduleFiles) {
		const module = require(`./modules/${moduleFile}`);

		if (!module) return logger.error(`Module '${moduleFile}' doesn't exist anymore.`);
		else logger.info(`Module '${chalk.blueBright(moduleFile)}' has been succesfully loaded.`);

		// Push `client` and `vk` objects to allow modules
		// to expand base functionality of the bot.
		module(client, vk);
	}

	logger.info(chalk.green("Running using VK and Discord tokens."));
});

client.on("message", (message) => {
	console.log(message.content);
});

client.login(settings.general["tokenDiscord"]);
