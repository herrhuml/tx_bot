const { roles, Discord } = require('../utils/imports');
const utils = require('../utils/utils');

module.exports = {
	name: 'test',
	async execute(message, args) {
		/*var msg = '';

		for (var role of roles.customer) {
			msg += `<@&${role}>\n`;
		}

		var embed = new Discord.MessageEmbed().setTitle('customer roles').setDescription(msg);
		message.channel.send(embed);*/

		//var { id, channel } = await this.getChannel(message, args[0]);

		//console.log({ channel });

		/*var options = { limit: 100 };
		var totalSize = 0;
		let lastID;

		var embed = new Discord.MessageEmbed().setTitle(channel.name).setDescription(`Fetched ${totalSize} messages`);
		var infoMsg = await message.channel.send(embed);

		while (true) {
			if (lastID) {
				options.before = lastID;
			}

			var msgs = await channel.messages.fetch(options);
			let size = msgs.size;
			totalSize += size;
			lastID = msgs.last().id;

			var embed = new Discord.MessageEmbed().setTitle(channel.name).setDescription(`Fetched ${totalSize} messages`);
			await infoMsg.edit(embed);

			if (size != 100) {
				break;
			}
		}
		console.log({ totalSize });*/
		//var embed = new Discord.MessageEmbed().setTitle(`${channel.name}`).addField('msg count', count);
		//message.channel.send(embed);
		const author = message.member;

		const reactFilter = (reaction, user) => {
			return ['✅', '❌'].includes(reaction.emoji.name) && user.id === author.id;
		};

		var reactMsg = await message.channel.send(`test message`);
		reactMsg.react('✅');
		reactMsg.react('❌');

		var reactCollector = reactMsg.createReactionCollector(reactFilter, { time: 180000 });

		reactCollector.on('collect', (r) => {
			if (r.emoji.name == '✅') {
				reactCollector.stop('continue');
			} else {
				reactCollector.stop('stop');
			}
		});
		reactCollector.on('end', (collected, reason) => {
			message.channel.send(`collector ended, reason: ${reason}`);
		});
		/*var embed = new Discord.MessageEmbed().setTitle('test').addField('something', '<fivem://connect/na.tycoon.community:30124>');
		message.channel.send(embed);*/
	},
	async getChannel(message, mention) {
		var id = null,
			matches = null,
			channel = null;
		if (mention != undefined) {
			matches = mention.match(/^<#(\d+)>$/);

			if (matches != null) {
				id = matches[1];
			} else {
				matches = mention.match(/^(\d+)$/);
				if (matches != null) {
					id = matches[0];
				}
			}

			channel = await message.guild.channels.resolve(id);
		}
		return { id, channel };
	}
};
