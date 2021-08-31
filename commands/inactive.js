const { axios, webapp, secretKey, roles } = require('../utils/imports');
const perms = require('./perms');
const utils = require('../utils/utils');

module.exports = {
	name: 'inactive',
	async execute(message, args) {
		var author = message.member;
		if (!utils.hasRole(author, 'managers')) {
			message.channel.send(`You don't have permission to use this command.`);
			return;
		}

		for (var mention of args) {
			var { id, member } = utils.getMember(message, mention);

			if (id == null || member == null) {
				message.channel.send(`member not found`);
				continue;
			}

			if (!utils.hasRole(member, 'staff')) {
				message.channel.send('error: user already inactive or not a member of staff');
				return;
			}

			try {
				let msg = await message.channel.send(`Setting **${member.user.username}** <@${id}> inactive...`);

				let resGetRoles = await axios.post(webapp, {
					key: secretKey,
					id: id,
					action: 'get_discord_roles'
				});

				if (resGetRoles.data.state == 'success') {
					/* remove discord roles */
					await member.roles.add(roles.inactive);
					var memberRoles = resGetRoles.data.message.split(',');
					await member.roles.remove(memberRoles);
					msg.content = `${msg.content}\r\nRemoved discord roles`;
					msg.edit(msg.content);

					/* remove sheet permissions */
					perms.execute(message, ['remove', id], false);
					msg.content = `${msg.content}, Removed sheet permissions`;
					msg.edit(msg.content);

					/* move worker to the inactive sheet */
					try {
						let resMoveToInactive = await axios.post(webapp, {
							key: secretKey,
							id: id,
							action: 'move_to_inactive'
						});
						if (resMoveToInactive.data.state == 'success') {
							msg.content = `${msg.content}, Moved to inactive sheet`;
							msg.edit(msg.content);
							msg.content = `${msg.content}\r\nWorker set inactive successfully.`;
							msg.edit(msg.content);
						}
					} catch (err) {
						console.log(err);
					}
				}
			} catch (error) {
				message.channel.send('an error occured while trying to set user inactive');
				console.error(error);
			}
		}
	}
};
