const commandStore = require("../../utils/commandStore");

module.exports = {
	aliases: ["h"],
	category: "General",
	command: "help",
	description: "Can be used when changing stuff",
	permissions: null,
	async run(message, client, vk) {
		message.reply((await vk.api.users.get({ user_ids: 1 })).toString());
	},
};
