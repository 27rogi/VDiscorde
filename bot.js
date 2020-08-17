const settings = require("./settings.json");

const Discord = require("discord.js");
const fs = require("fs");
const logger = require("./utils/logger");
const chalk = require("chalk");
const { VK } = require("vk-io");
const languages = require("./utils/languages");

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

	languages.init(settings.localization.defaultLanguage);

	for (const moduleFile of moduleFiles) {
		const module = require(`./modules/${moduleFile}`);

		if (!module) return logger.error(`Module '${moduleFile}' doesn't exist anymore.`);
		else logger.info(`Module '${chalk.blueBright(moduleFile)}' has been succesfully loaded.`);

		// Push `client` and `vk` objects to allow modules to expand base functionality of the bot.
		try {
			module(client, vk);
		}
		catch (err) {
			logger.error("Internal error occured: \n" + err);
		}
	}

	logger.info(chalk.green(`Running on user ${client.user.tag} using VK and Discord tokens.`));
});

client.login(settings.general["tokenDiscord"]);

client.on("message", (message) => {
	logger.info(message.content);
});

// if there are errors, log them
client.on("disconnect", () => logger.info("Bot is disconnecting..."))
	.on("reconnecting", () => logger.info("Bot reconnecting..."))
	.on("error", (e) => logger.error(e))
	.on("warn", (info) => logger.info(info));

// if there is an unhandledRejection, log them
process.on("unhandledRejection", (err) => {
	logger.error(err);
});
