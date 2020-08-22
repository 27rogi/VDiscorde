// languages file provides basic multilingual support for the bot.

import fs from "fs";
import logger from "./logger";
import * as dotProp from "dot-prop";
import chalk from "chalk";

import settings from "../settings.json";

const languages: any = {
	currentLanguage: null,
};

export default {
	init(currentLanguage: string) {
		languages["currentLanguage"] = currentLanguage;
		logger.info(`Default bot language is ${currentLanguage}`);
		const languageFiles = fs.readdirSync(process.cwd() + `/${settings.localization.languageFolder}/`).filter((file: string) => file.endsWith(".json"));

		for (const languageFile of languageFiles) {
			const language = require(process.cwd() + `/${settings.localization.languageFolder}/${languageFile}`);

			if (language) logger.info(`Registered translations for language ${languageFile.split(".json")[0]}`);
			else return logger.error(`Error occurred while loading ${languageFile}.`);

			languages[languageFile.split(".json")[0]] = language;
		}

		if (typeof languages[currentLanguage] !== "object") return logger.error(`You don't have language file named ${currentLanguage}!`);
	},
	get(path: string, placeholders: { [x: string]: any; }) {
		if (typeof placeholders !== "object") placeholders = {};

		let languageString: string = dotProp.get(languages[languages.currentLanguage], path);
		if (languageString == undefined) return logger.error(`Not able to find string by path ${chalk.yellow(path)} for language ${chalk.yellow(languages.currentLanguage)}.`);

		for (const placeholder in placeholders) {
			languageString = languageString.replace(new RegExp(`\\[\\[${placeholder}\\]\\]*`, "g"), placeholders[placeholder]);
		}

		return languageString;
	},
	getLanguages() {
		return Object.keys(languages);
	},
	getCurrentLanguage() {
		return languages.currentLanguage;
	},
	getLanguage(language: string | number) {
		return languages[language];
	},
};
