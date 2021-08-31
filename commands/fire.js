var { roles, axios, webapp, secretKey } = require('../utils/imports');
var utils = require('../utils/utils');
var perms = require('./perms');

module.exports = {
	name: 'fire',
	async execute(message, args) {
		var author = message.member;
		var { id, member } = await utils.getMember(message, args[0]);

		if (!utils.hasRole(author, 'managers')) {
			message.channel.send(`You don't have permission to use this command.`);
			return;
		}

		if (utils.hasRole(member, 'managers')) {
			message.channel.send(`This user is protected.`);
			return;
		}

		/* fire reason collector */
		var reason = null;
		const filter = (response) => {
			return response.author.id === author.id;
		};
		const reactFilter = (reaction, user) => {
			return ['✅', '❌'].includes(reaction.emoji.name) && user.id === author.id;
		};

		const collector = message.channel.createMessageCollector(filter, { time: 120000 });
		collector.on('collect', (m) => {
			reason = m.content;
			message.channel.send(`fire reason set to: ${reason}`);
		});
		collector.on('end', (collected) => {});

		var reactMsg = await message.channel.send(`Please provide a reason, then react with ✅ to continue or ❌ to stop.`);
		reactMsg.react('✅');
		reactMsg.react('❌');
		var reactCollector = reactMsg.createReactionCollector(reactFilter, { time: 180000 });

		reactCollector.on('collect', (r) => {
			if (r.emoji.name == '✅') {
				reactCollector.stop('continue');
				collector.stop('continue');
			} else {
				reactCollector.stop('stop');
				collector.stop('stop');
			}
		});
		reactCollector.on('end', async (collected, reason) => {
			if (reason == 'stop') {
				return;
			} else if (reason == 'continue') {
				var infoMsg = await message.channel.send(`Firing...`);

				if (member != null) {
					await this.removeRoles(member);
					await infoMsg.edit(`${infoMsg.content}, removed roles`);
				}

				if (id != null) {
					this.removePerms(message, id);
					await infoMsg.edit(`${infoMsg.content}, removed sheet permissions`);

					if ((await this.moveToExStaff(id)) == 'success') {
						await infoMsg.edit(`${infoMsg.content}, moved to Ex Staff`);
					}
				}
			}
		});
	},
	async removeRoles(member) {
		var rolesToRemove = member.roles.cache.filter((role) => {
			return !roles.customers.includes(role.id) && role.name != '@everyone';
		});

		await member.roles.remove(rolesToRemove);

		if (!utils.hasRole(member, 'customers')) {
			member.roles.add(roles.customer);
		}
	},
	async removePerms(message, id) {
		await perms.execute(message, ['remove', id], false);
	},
	async moveToExStaff(id, reason) {
		var res = await axios.post(webapp, {
			key: secretKey,
			action: 'move_to_ex',
			id: id,
			reason: reason
		});

		if (res.data.state == 'success') {
			return 'success';
		} else {
			console.log(res.data);
		}
	}
};
