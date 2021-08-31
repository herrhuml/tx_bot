#!/usr/bin/env node
const { debug, Discord, fs, prefix, botToken, channels } = require("./utils/imports");
const utils = require("./utils/utils");

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands/").filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

bot.login(botToken);

bot.on("ready", async function () {
  bot.user.setActivity("YOU WORK", {
    type: "WATCHING",
  });
  console.log("hello there");
});

bot.on("message", async function (message) {
  if (!message.content.startsWith(prefix) || message.author.bot || message.channel === "dm") return;
  var args = message.content.slice(prefix.length).split(/ +/);
  var command = args.shift().toLocaleLowerCase();

  if (!bot.commands.has(command)) return;

  try {
    bot.commands.get(command).execute(message, args);
  } catch (err) {
    console.error(err);
  }
});

bot.on("guildMemberAdd", async (member) => {
  if (!debug) {
    let date = utils.currentDate();

    let embed = new Discord.MessageEmbed()
      .setTitle(`Welcome to TransportX ${member.user.username}`)
      .setDescription(`Enjoy your stay here <@${member.id}>`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter(
        `TransportX - ${date}`,
        "https://media.discordapp.net/attachments/537699515940208675/540205206357540904/LOGO11.png"
      );
    let channel = await member.guild.channels.resolve(channels.welcome);
    channel.send(embed);
  }
});

bot.on("error", function (error) {
  console.error(error);
});
