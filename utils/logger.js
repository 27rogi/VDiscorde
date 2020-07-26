const chalk = require("chalk");
const settings = require("../settings.json");

const prefix = "(VDiscorde)";

module.exports = {
	info(message) {
		return console.log(chalk.bgBlueBright.black(prefix) + " " + message);
	},
	debug(message) {
		if (settings.general["debug"] === false) return;
		return console.log(chalk.bgBlueBright.black(prefix) + " " + chalk.gray(message));
	},
	error(error) {
		return console.error(chalk.bgRed.black(prefix + "| ERROR: ") + " " + chalk.red(error));
	},
};
