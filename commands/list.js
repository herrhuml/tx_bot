const { Discord } = require('../utils/imports');
const utils = require('../utils/utils');

module.exports = {
	name: 'list',
	async execute(message, args) {
		var { id, role } = this.getRole(message, args[0]);
		var embedMentions = '';
		var membersInRole = [];
		var members = await message.guild.members.cache;

		members.forEach((member) => {
			if (member.roles.cache.some((role) => id == role.id)) {
				membersInRole.push(member);
			}
		});

		membersInRole.forEach((member) => {
			embedMentions += `<@${member.id}>\n`;
		});

		var embed = new Discord.MessageEmbed().setTitle(`Members in ${role.name}`).setDescription(`total: **${membersInRole.length}**\n${embedMentions}`).setColor(role.color);
		message.channel.send(embed);
	},
	getRole(message, mention) {
		var id = null,
			matches = null,
			role = null;
		if (mention != undefined) {
			matches = mention.match(/^<@&(\d+)>$/);

			if (matches != null) {
				id = matches[1];
			} else {
				matches = mention.match(/^(\d+)$/);
				if (matches != null) {
					id = matches[0];
				}
			}

			role = message.guild.roles.cache.get(id);
		}

		return { id, role };
	}
};
