// The small helper object that allows us to store command information
// in one place and modify it without duplicating the code.
const commands = {};

module.exports = {
	getByCategory(category) {
		return commands[category];
	},
	getByName(name) {
		return new Promise((resolve, reject) => {
			for (const category of Object.keys(commands)) {
				if (commands[category][name]) resolve(commands[category][name]);
			}
			reject(null);
		});
	},
	getCategories() {
		return Object.keys(commands);
	},
	/**
     * Adds a new command information to the command store.
     *
     * @param {string} category - Category that this command belongs.
     * @param {string} command - Word that used to call the command.
     * @param {?Array} aliases - Array of alternative words to call the command. If you don't need aliases just use `null`.
     * @param {string} description - Description of your command that will be used in help.
     * @param {Array} permissions - Array of permissions that user should have to call the command.
     * @returns {Object}
     */
	add(category, command, aliases, description, permissions) {
		if (!commands[category]) commands[category] = {};

		if (!commands[category][command]) {
			commands[category][command] = {
				aliases: aliases,
				description: description,
				permissions: permissions,
			};
		}
		return commands;
	},
	getAll() {
		return commands;
	},
};
