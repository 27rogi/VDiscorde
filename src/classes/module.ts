import * as Discord from "discord.js";
import { VK } from "vk-io";
import { BitFieldResolvable, PermissionString } from "discord.js";

export interface ModuleInterface {
    client: Discord.Client,
    vkAPI: VK,
    execute(): void | Promise<void>,
}

export interface ImportedModule {
	default: any;
}

export class Module implements ModuleInterface {
    client: Discord.Client;
    vkAPI: VK;

    constructor(client: Discord.Client, vkAPI: VK) {
        this.client = client;
        this.vkAPI = vkAPI;
    }

    execute(): void | Promise<void> { }

}
