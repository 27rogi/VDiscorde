/* eslint-disable no-console */
import chalk from "chalk";
import settings from "../settings.json";

const prefix = "(VDiscorde)";

export default {
	info(message: string) {
		return console.log(chalk.bgBlueBright.black(prefix) + " " + message);
	},
	debug(message: string) {
		if (settings.general["debug"] === false) return;
		return console.log(chalk.bgBlueBright.black(prefix) + " " + chalk.gray(message));
	},
	error(error: string | Error) {
		return console.error(chalk.bgRed.black(prefix + " | ERROR: ") + " " + chalk.red(error));
	},
};
