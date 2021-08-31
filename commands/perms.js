const { axios, webapp, secretKey } = require('../utils/imports');
const utils = require('../utils/utils');

module.exports = {
	name: 'perms',
	async execute(message, args, postMsg = true) {
		var author = message.member;
		var member = null;
		var id = null;

		if (!utils.hasRole(author, 'managers')) {
			message.channel.send(`You don't have permission to use this command.`);
			return;
		}

		var { id, member } = utils.getMember(message, args[args.length - 1]);

		if (id == null) {
			message.channel.send(`ID isn't valid.`);
			return;
		}

		var action = args[0];
		switch (action) {
			case 'add':
				{
					var perms = args[1];
					var allowed = ['both', 'tokens', 'cargo'];
					if (allowed.includes(perms)) {
						try {
							let res = await axios.post(webapp, {
								id: id,
								perms: perms,
								key: secretKey,
								action: 'add_perms'
							});

							if (res.data.state == 'success') {
								if (postMsg) {
									if (member != null) {
										message.channel.send(`Permissions to **${perms}** added for **${member.user.username}** <@${member.id}>`);
									} else {
										message.channel.send(`Permissions removed for **${id}**`);
									}
								}
							}
						} catch (err) {
							console.error(err);
						}
					}
				}
				break;
			case 'remove':
				{
					try {
						let res = await axios.post(webapp, {
							id: id,
							key: secretKey,
							action: 'remove_perms'
						});

						if (res.data.state == 'success') {
							if (postMsg) {
								if (member != null) {
									message.channel.send(`Permissions removed for **${member.user.username}** <@${member.id}>`);
								} else {
									message.channel.send(`Permissions removed for **${id}**`);
								}
							}
						}
					} catch (err) {
						console.error(err);
					}
				}
				break;
			default:
				break;
		}
	}
};
