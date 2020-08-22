import * as Discord from "discord.js";
import { VK } from "vk-io";
import { BitFieldResolvable, PermissionString } from "discord.js";

export interface CommandSettings {
	command: string,
	category: string,
    description: string,
	aliases?: Array<string>,
    enabled?: boolean,
    permissions?: BitFieldResolvable<PermissionString>,
}

export class Command {
    public readonly settings: CommandSettings

    constructor(command: CommandSettings) {
        this.settings = command;
    }

    onLoad(client: Discord.Client, message: Discord.Message, args: string[], vkAPI: VK) { };

    hasPermission(guild: Discord.Guild, user: Discord.User): boolean {
        if (!guild.member(user.id).hasPermission(this.settings.permissions)) return true;
        else return false;
    }
}
