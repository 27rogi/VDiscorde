// languages file provides basic multilingual support for the bot.

const fs = require("fs");
const logger = require("./logger");
const dotProp = require("dot-prop");
const settings = require("../settings.json");
const chalk = require("chalk");

const languages = {};

module.exports = {
	init(currentLanguage) {
		languages.currentLanguage = currentLanguage;
		logger.info(`Default bot language is ${currentLanguage}`);
		const languageFiles = fs.readdirSync(process.cwd() + `/${settings.localization.languageFolder}/`).filter((file) => file.endsWith(".json"));

		for (const languageFile of languageFiles) {
			const language = require(process.cwd() + `/${settings.localization.languageFolder}/${languageFile}`);

			if (language) logger.info(`Registered translations for language ${languageFile.split(".json")[0]}`);
			else return logger.error(`Error occurred while loading ${languageFile}.`);

			languages[languageFile.split(".json")[0]] = language;
		}

		if (typeof languages[currentLanguage] !== "object") return logger.error(`You don't have language file named ${currentLanguage}!`);
	},
	get(path, placeholders) {
		if (typeof placeholders !== "object") placeholders = {};

		let languageObject = dotProp.get(languages[languages.currentLanguage], path);
		if (languageObject == undefined) return logger.error(`Not able to find string by path ${chalk.yellow(path)} for language ${chalk.yellow(languages.currentLanguage)}.`);

		for (const placeholder in placeholders) {
			languageObject = languageObject.replace(new RegExp(`\\[\\[${placeholder}\\]\\]*`, "g"), placeholders[placeholder]);
		}

		return languageObject;
	},
	getLanguages() {
		return Object.keys(languages);
	},
	getCurrentLanguage() {
		return languages.currentLanguage;
	},
	getLanguage(language) {
		return languages[language];
	},
};
