const { axios, webapp, secretKey, roles } = require('../utils/imports');
const perms = require('./perms');
const utils = require('../utils/utils');

module.exports = {
	name: 'active',
	async execute(message, args) {
		var author = message.member;
		if (!utils.hasRole(author, 'managers')) {
			message.channel.send(`You don't have permission for this command`);
			return;
		}
		var { id, member } = utils.getMember(message, args[0]);

		if (utils.hasRole(member, 'inactive')) {
			try {
				let msg = await message.channel.send(`Setting **${member.user.username}** <@${id}> active...`);

				/* move to active sheet */
				let resMoveWorker = await axios.post(webapp, {
					key: secretKey,
					id: id,
					action: 'move_to_active'
				});
				if (resMoveWorker.data.state != 'success') {
					console.log(resMoveWorker.data.message);
					return;
				}
				msg.content = `${msg.content}\r\nMoved to active sheet`;
				msg.edit(msg.content);

				/* fetch discord roles */
				let resGetRoles = await axios.post(webapp, {
					key: secretKey,
					id: id,
					action: 'get_discord_roles'
				});

				if (resGetRoles.data.state == 'success' && resMoveWorker.data.state == 'success') {
					try {
						/* add discord roles */
						await member.roles.remove(roles.inactive);
						var memberRoles = resGetRoles.data.message.split(',');
						await member.roles.add(memberRoles);
						msg.content = `${msg.content}, Added discord roles`;
						msg.edit(msg.content);

						/* add sheet permissions */
						let permsTo = null;
						if (memberRoles.includes(roles.tokens) && memberRoles.includes(roles.cargo)) {
							permsTo = 'both';
						} else if (memberRoles.includes(roles.tokens)) {
							permsTo = 'tokens';
						} else if (memberRoles.includes(roles.cargo)) {
							permsTo = 'cargo';
						}
						if (permsTo != null) {
							perms.execute(message, ['add', permsTo, id], false);
							msg.content = `${msg.content}, Added sheet permissions`;
							msg.edit(msg.content);
							msg.content = `${msg.content}\r\nWorker set active successfully.`;
							msg.edit(msg.content);
						}
					} catch (err) {
						console.error(err);
					}
				}
			} catch (error) {
				message.channel.send('an error encountered while trying to set user active');
				console.error(error);
			}
		} else {
			message.channel.send('error: user not inactive or not a member of staff');
		}
	}
};
