import settings from "./settings.json";

import * as Discord from "discord.js";
import * as fs from "fs";
import logger from "./utils/logger";
import chalk from "chalk";
import { VK } from "vk-io";
import languages from "./utils/languages";
import { ImportedModule } from './classes/module';

const client = new Discord.Client();
const moduleFiles = fs.readdirSync(process.cwd() + "/modules").filter((file: string) => file.endsWith(".js"));

const vk: VK = new VK({
	token: settings.general["tokenVK"],
});

client.once("ready", async () => {
	// TODO: Find a better way for VK token validation.
	await vk.api.users.get({ user_ids: "1" }).catch((err: Error) => {
		logger.error(err);
		process.exit(1);
	});

	languages.init(settings.localization.defaultLanguage);

	for (const moduleFile of moduleFiles) {
		import(process.cwd() + `/modules/${moduleFile}`).then((module: ImportedModule) => {

			if (!module) return logger.error(`Module '${moduleFile}' doesn't exist anymore.`);
			else logger.info(`Module '${chalk.blueBright(moduleFile)}' has been succesfully loaded.`);
	
			// Push `client` and `vk` objects to allow modules to expand base functionality of the bot.
			try {
				new module.default(client, vk).execute();
			} catch (err) {
				logger.error(err);
			}

		});
	}

	logger.info(chalk.green(`Running on user ${client.user.tag} using VK and Discord tokens.`));
});

client.login(settings.general["tokenDiscord"]);

client.on("message", (message: Discord.Message) => {
	logger.info(message.content);
});

// if there are errors, log them
client.on("disconnect", () => logger.info("Bot is disconnecting..."))
      .on("error", (err: Error) => logger.error(err))
      .on("warn", (info: any) => logger.info(info));

// if there is an unhandledRejection, log them
process.on("unhandledRejection", (err: Error) => {
	logger.error(err);
});
