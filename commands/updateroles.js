const { axios, webapp, secretKey, roles } = require('../utils/imports');
const utils = require('../utils/utils');

module.exports = {
	name: 'updateroles',
	async execute(message, args, sendMsg = true) {
		var author = message.member;
		var member = null;
		if (!utils.hasRole(author, 'managers')) {
			message.channel.send(`You don't have permission to use this command.`);
		}

		var { id, member } = utils.getMember(message, args[0]);

		if (member != null) {
			if (!utils.hasRole(member, 'inactive')) {
				var memberRoles = member.roles.cache;
				var ids = [];

				memberRoles.forEach((e) => {
					if (!roles.ignored.find((el) => el == e.id)) {
						ids.push(e.id);
					}
				});

				var string = ids.join(',');

				try {
					let res = await axios.post(webapp, {
						key: secretKey,
						id: id,
						roles: string,
						action: 'update_discord_roles'
					});

					console.log(res.data.state);
					console.log(res.data.message);

					if (res.data.state == 'success') {
						if (sendMsg) {
							message.channel.send(`updated roles for **${member.displayName}**`);
						}
					}
				} catch (error) {
					console.error(error);
				}
			} else {
				if (sendMsg) {
					message.channel.send('aborted, member has the inactive role');
				}
			}
		} else {
			if (sendMsg) {
				message.channel.send('member not found');
			}
		}
	}
};
