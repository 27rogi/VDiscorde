import commandStore from "../../utils/commandStore";
import * as Discord from "discord.js";
import logger from "../../utils/logger";
import { Command } from "../../classes/command";
import settings from "../../settings.json";
import { VK } from "vk-io";

export default class extends Command {

	constructor() {
		super({
			aliases: ["u"],
			category: "Users",
			command: "user",
			description: "Allows you to fetch data of VK user.",
			permissions: ["KICK_MEMBERS"],
		});
	}

	onLoad(client: Discord.Client, message: Discord.Message, args: string[], vkAPI: VK) {
		if (args.length <= 0) return message.reply("You must specify the username! (Like: `vd.user id1`)");
		let userId = args[0].trim().toLowerCase();

		if (userId.indexOf("vk.com/") != -1) {
			userId = userId.split("vk.com/")[1];
		}

		vkAPI.api.users.get({
			user_ids: userId,
			fields: ["common_count","sex","last_seen","bdate","followers_count","about","timezone","photo_100","city","verified"],
		}).then((responce: any) => {
			console.log(responce);
			message.reply("Information: " + responce);
		}).catch((err: any) => {
			message.reply(err);
		});
	}
};
