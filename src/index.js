// Discord.js Initialization
const Discord = require('discord.js');
const bot = new Discord.Client();

const fs = require("fs");

// Config
const config = require("./config.json");

let defaultPrefix = config.prefix;

bot.login(config.token);

// Account data HashMap initialization
var HashMap = require('hashmap');
var map = new HashMap();

// VK API Initialization
const VK = require('vk-io');
const vk = new VK({
    token: config.vk_token
});

const { ApiError } = require('vk-io/errors');

// Moment.js Initialization
var moment = require('moment');

bot.on('ready', () => {
    bot.user.setGame("vk!help");
});

function getPrefix() {
    return "vk!";
}

// function checkLanguage(id) {
//     let lang = JSON.parse(fs.readFileSync("./lang.json", "utf8"));

//     let ServerID = bot.guilds.get(id).id;
//     if (lang[ServerID] !== undefined) {
//         if (lang[ServerID].lang === "ru") {
//             return "russian";
//         } else {
//             return "english";
//         }
//     } else {
//         return "english";
//     }
// }

// function getMessage(lang, messageID) {
//     return JSON.parse(fs.readFileSync("./messages.json", "utf8"))
// }

// function saveLang() {
//     fs.writeFile("./lang.json", JSON.stringify(points), (err) => {
//         if (err) console.error(err)
//     });
// }

// Thanks to @shomrat for this code.
function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Янв.', 'Фев.', 'Март', 'Апр.', 'Май', 'Июнь', 'Июль', 'Авг.', 'Сен.', 'Окт.', 'Ноя.', 'Дек.'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}

function generateKey() {
    var text = "";
    var possible = "&*!()@?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 11; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function isIdInt(id, ifNot) {
    if (parseInt(id) === ifNot.object_id) {
        return id;
    } else {
        return ifNot.object_id;
    }
}


function getUsercard(userId, message) {
    if (userId != undefined) {
        vk.api.call('users.get', {
                user_ids: userId,
                fields: 'sex, status, about, photo_max, online, followers_count, sex, bdate, last_seen'
            }).then((user) => {
                vk.api.call('utils.resolveScreenName', {
                    screen_name: userId
                }).then((userID) => {
                    let id = isIdInt(userId, userID);
                    vk.api.call('friends.get', {
                        user_id: id,
                        count: 0
                    }).then((friends) => {
                        for (userData in user) {
                            var EmbedMsg = new Discord.RichEmbed()
                                .setTitle(`Информация о пользователе: **${userId}**`)
                                .setColor("#507299")
                                .setThumbnail(user[userData].photo_max)
                                .setURL("https://vk.com/" + user[userData].id)
                                .addField("🎙 Имя", user[userData].first_name + " " + user[userData].last_name, true);
                            switch (user[userData].sex) {
                                case 2:
                                    EmbedMsg.addField("👨 Пол", "Мужской", true);
                                    break;
                                case 1:
                                    EmbedMsg.addField("👩 Пол", "Женский", true);
                                    break;
                            }
                            switch (user[userData].online) {
                                case 1:
                                    EmbedMsg.addField("🆗 Онлайн?", "Да", true);
                                    break;
                                case 0:
                                    if (user[userData].last_seen.time !== undefined) {
                                        EmbedMsg.addField("⏰ Был в сети", timeConverter(user[userData].last_seen.time), true);
                                    }
                                    break;
                            }

                            if (user[userData].bdate !== undefined && user[userData].bdate !== "") {
                                EmbedMsg.addField("🎂 День рождения", user[userData].bdate, true);
                            }
                            if (friends.count !== undefined) {
                                EmbedMsg.addField("👥 Друзья", friends.count, true);
                            } else {
                                console.log("странна");
                            }

                            EmbedMsg.addField("👤 Подписчики", user[userData].followers_count, true);

                            if (user[userData].about !== undefined && user[userData].about !== "") {
                                EmbedMsg.addField("📋 О пользователе", user[userData].about, true);
                            }

                            if (user[userData].status !== undefined && user[userData].status !== "") {
                                EmbedMsg.addField("🖌 Статус", user[userData].status, true);
                            }
                            message.channel.send({
                                embed: EmbedMsg
                            });
                        }
                    });
                });
            })
            .catch(ApiError, (error) => {
                if (error.code == "113") {
                    message.reply("Ошибка! Такой айди пользователя неверен!");
                } else {
                    console.log(error);
                }
            });
    }
}

bot.on('message', (message) => {
    if (message.content.startsWith(getPrefix(message.guild.id) + "user")) {
        if (message.author.bot) return;
        const args = message.content.split(/\s+/g).slice(1);
        let vkID = args[0].replace("https://vk.com/", "").replace("http://vk.com/", "").replace("/", "");
        let member = message.mentions.members.first();
        if (member !== undefined) {
            let users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
            if (users[member.id] === undefined) { message.reply("Данный пользователь ещё не привязал свой аккаунт **ВКонтакте**!"); return; }
            getUsercard(users[member.id].vkLink, message);
        } else if (vkID !== undefined || vkID !== "") {
            getUsercard(vkID, message);
        }
    }

    if (message.content.startsWith(getPrefix(message.guild.id) + "group")) {
        if (message.author.bot) return;
        const args = message.content.split(/\s+/g).slice(1);
        let groupID = args[0];
        if (groupID != undefined) {
            message.reply(`Проверяем наличие группы с ID равным **${groupID.replace(',', "")}**`).then(message => message.delete(30000));
            vk.api.groups.getById({
                    group_id: groupID.replace(',', ""),
                    fields: 'members_count,description,status,activity,photo_max'
                })
                .then((group) => {
                    for (groupData in group) {
                        var EmbedMsg = new Discord.RichEmbed()
                            .setTitle(`Информация о сообществе: **${groupID}**`)
                            .setColor("#507299")
                            .setImage(group[groupData].photo_max)
                            .setThumbnail(group[groupData].photo_max)
                            .setURL("https://vk.com/" + group[groupData].id)
                            .addField("🎙 Название сообщества", group[groupData].name, true);
                        if (group[groupData].description != undefined && group[groupData].description != "") {
                            EmbedMsg.addField("🖌 Описание", group[groupData].description, true);
                        }
                        switch (group[groupData].is_closed) {
                            case 1:
                                EmbedMsg.addField("🔒 Закрытое?", "Да", true);
                                break;
                            case 0:
                                EmbedMsg.addField("🔒 Закрытое?", "Нет", true);
                                break;
                        }
                        if (group[groupData].activity != undefined && group[groupData].activity != "") {
                            EmbedMsg.addField("📝 Тип", group[groupData].activity, true);
                        }
                        EmbedMsg.addField("👥 Участники", group[groupData].members_count, true);
                        message.channel.send({ embed: EmbedMsg });
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            message.reply("**Ой!** Вы забыли указать ID пользователя!");
        }
    }

    /*
    / Not working >_>
    */
    // if (message.content.startsWith(getPrefix(message.guild.id) + "document")) {
    //     if (message.author.bot) return;
    //     const args = message.content.split(/\s+/g).slice(1);
    //     let docsID = args[0];
    //     if (docsID != undefined) {
    //         message.reply(`Выполняем поиск документа с ID равным **${docsID.replace(',', "")}**`).then(message => message.delete(30000));
    //         vk.api.docs.getById({
    //                 docs: docsID.replace(',', "")
    //             })
    //             .then((docs) => {
    //                 for (docsData in docs) {
    //                     message.channel.send(docs[docsData].url);
    //                 }
    //             })
    //             .catch((error) => {
    //                 if (error.contains("Invalid user id")) {

    //                 }
    //                 console.error(error);
    //             });
    //     } else {
    //         message.reply("**Ой!** Вы забыли указать ID документа!");
    //     }
    // }

    // if (message.content.startsWith(getPrefix(message.guild.id) + "prefix")) {
    //     if (message.author.bot) return;
    //     let perms = message.member.permissions;
    //     let isAdmin = message.member.hasPermission("ADMINISTRATOR");
    //     if (isAdmin) {

    //         const args = message.content.split(/\s+/g).slice(1);
    //         let prefixName = args[0];
    //         if (prefixName != undefined) {

    //             sql.get(`SELECT * FROM servers WHERE seid = "${message.guild.id}"`).then(row => {
    //                 if (!row) { // Can't find the row.
    //                     sql.run("INSERT INTO servers (seid, prefix) VALUES (?, ?)", [message.guild.id, prefixName]);
    //                 } else { // Can find the row.
    //                     sql.run("UPDATE servers SET prefix= " + prefixName + " WHERE seid = " + message.guild.id);
    //                 }
    //                 message.reply("Префикс был успешно изменен на **" + prefixName + "**.");
    //             }).catch(() => {
    //                 console.error; // Gotta log those errors
    //                 sql.run("CREATE TABLE IF NOT EXISTS servers (seid TEXT, prefix TEXT)").then(() => {
    //                     sql.run("INSERT INTO servers (seid, prefix) VALUES (?, ?)", [message.guild.id, defaultPrefix]);
    //                 });
    //             });
    //         } else {
    //             message.reply("Укажи **префикс** который ты хочешь использовать!");
    //         }
    //     } else {
    //         message.reply("У вас нет прав **администратора** для выполнения этого действия.");
    //     }
    // }

    if (message.content.startsWith(getPrefix(message.guild.id) + "help")) {
        if (message.author.bot) return;
        var EmbedMsg = new Discord.RichEmbed()
            .setTitle(bot.emojis.get("346743291393343500") + " Помощь [VKBot v1.0]")
            .setDescription("Полезная информация о командах и функциях бота.")
            .setColor("#507299")
            .addBlankField()
            .addField("📋 Команды бота", "Стандартный префикс команд это **vk!**, скоро его можно будет изменить.\n\n**vk!help** - Показывает раздел помощи\n**vk!prefix** *<префикс>* - Установить свой префикс(не работает)\n**vk!user** *<ссылка на профиль>*\n**vk!group** *<ссылка на группу>*\n\n**vk!link** *<ссылка на ваш профиль>* - Привязать ваш профиль ВК к боту *(Подробнее в разделе Привязка)*")
            .addField("🛡 Привязка аккаунта", "Для привязки вашего аккаунта ВК к аккаунту Discord используйте команду **vk!link** *<ссылка на ваш профиль>* после чего вам нужно будет следовать инструкциям в сообщении, привязка нескольких аккаунтов невозможна!");
        message.author.send({
            embed: EmbedMsg
        });
        message.reply(`Сообщение было успешно отправлено, проверьте свои ЛС`).then(message => message.delete(10000));
    }

    if (message.content.startsWith(getPrefix(message.guild.id) + "link")) {
        if (message.author.bot) return;

        let users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
        const args = message.content.split(/\s+/g).slice(1);
        let pageID = args[0];
        let key = generateKey();
        if (users[message.author.id] !== undefined) { message.reply("Вы уже привязали **свой аккаунт** к аккаунту **ВКонтакте**!"); return; }
        if (pageID === undefined) {
            message.reply("Вы не указали свой **id**/**никнейм**");
        } else {
            // Checking for user, if everything is normal we are generating a key.
            vk.api.users.get({
                    user_ids: pageID.replace(',', ""),
                })
                // If we got a error closing the script.
                .catch(ApiError, (error) => {
                    if (error.code == "113") {
                        message.reply("Указанный **id** пользователя неправильный!");
                        return;
                    }
                }).then((user) => {
                    for (userData in user) {
                        if (user[userData] !== undefined) {
                            if (!message.channel.type === "dm") { message.reply("В целях **безопасности** информация была отправлена вам в **ЛС**!"); }
                            map.set(message.author.id, `${key}|${pageID}`);
                            message.author.send(`Почти всё! Теперь установи в свой статус ВК следующий текст, ***${key}***\nПосле того как ты сделаешь это, напиши **vk!verify** и подтверди привязку.`);
                        }
                    }
                });
        }
    }

    if (message.content.startsWith(getPrefix(message.guild.id) + "unlink")) {
        // Loading a users.json
        let users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
        // If bot => return;
        if (message.author.bot) return;
        // If noithing found in users.json
        if (users[message.author.id] === undefined) { message.reply("Вы ещё не привязали **свой аккаунт** к аккаунту **ВКонтакте**!"); return; }
        // Deleting user info and saving users.json
        delete users[message.author.id];
        message.reply("Вы успешно отвязали **свой аккаунт** от аккаунта **ВКонтакте**!");
        fs.writeFile("./users.json", JSON.stringify(users), (err) => {
            if (err) console.error(err)
        });
    }

    if (message.content.startsWith(getPrefix(message.guild.id) + "verify")) {
        let users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
        if (message.author.bot) return;
        if (users[message.author.id] !== undefined) { message.reply("Вы уже привязали **свой аккаунт** к аккаунту **ВКонтакте**!"); return; }
        if (map.get(message.author.id) === undefined) { message.reply("Информации не найдено, походу вы не использовали **vk!link**."); return; }
        var userInfo = map.get(message.author.id).split('|');
        vk.api.users.get({
            user_ids: userInfo[1].replace(',', ""),
            fields: 'status'
        }).then((user) => {
            for (userData in user) {
                if (user[userData].status == userInfo[0]) {
                    message.reply("Подтверждено!");
                    message.reply("Инфо: " + userInfo[0] + " and " + userInfo[1]);
                    if (!users[message.author.id]) users[message.author.id] = {
                        vkLink: userInfo[1]
                    };
                    fs.writeFile("./users.json", JSON.stringify(users), (err) => {
                        if (err) console.error(err)
                    });
                    map.remove(message.author.id);
                } else {
                    message.reply("Статус не был изменен, попробуйте ещё раз.");
                }
            }
        });
    }
    // if (message.content.startsWith(getPrefix(message.guild.id) + "lang")) {
    //     const args = message.content.split(/\s+/g).slice(1);
    //     let arg = args[0];
    //     let lang = checkLanguage(message.guild.id);
    //     let langjson = JSON.parse(fs.readFileSync("./lang.json", "utf8"));

    //     if (arg === undefined) {
    //         if ((lang) === "russian") {
    //             message.channel.send("Russian");
    //         } else if ((lang) === "english") {
    //             message.channel.send("English");
    //         }
    //     }


    //     // No args defined ==> No result
    //     if (args[1] === undefined) { return; }
    //     if (arg !== "set") { return; }


    //     if (args[1] === "ru") {
    //         ;
    //         message.channel.send("!Russian");
    //         if(!langjson[message.guild.id]) langjson[message.guild.id] = {
    //             lang: 'ru'
    //         };
    //         saveLang();
    //     }
    //     if (args[1] === "en") {
    //         message.channel.send("!eng");
    //         if(!langjson[message.guild.id]) langjson[message.guild.id] = {
    //             lang: 'en'
    //         };
    //         saveLang();
    //     }
    // }

});