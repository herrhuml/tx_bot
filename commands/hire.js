const { axios, secretKey, webapp, Discord, roles, channels } = require('../utils/imports');
const utils = require('../utils/utils');
const perms = require('./perms');
const updateroles = require('./updateroles');
var info = {};
var infoMsg;
var appMsg;

module.exports = {
	name: 'hire',
	async execute(message, args) {
		var author = message.member;

		if (!utils.hasRole(author, 'managers')) {
			message.channel.send(`you don't have permissions for this command`);
			return;
		}

		if (args.length < 1) {
			return;
		}

		appMsg = await message.guild.channels.resolve(channels.applications).messages.fetch(args[0]);
		var fields = appMsg.embeds[0].fields;
		info = {
			name: fields[0].value,
			igID: fields[1].value,
			email: fields[3].value,
			rank: 'Staff',
			dcID: '',
			dcTag: fields[2].value,
			department: fields[4].value,
			date: utils.currentDate(),
			member: null
		};

		var member = null;
		var members = message.guild.members.cache;
		members.forEach((el) => {
			if (el.user.tag == info.dcTag) {
				member = el;
			}
		});

		if (member != null) {
			info.dcID = member.id;
			info.member = member;
			this.editInfo(message);
		} else {
			await message.channel.send('user not found, please provide an ID or tag the member instead');
			const filter = (response) => {
				return response.author.id === author.id;
			};

			const collector = message.channel.createMessageCollector(filter, { time: 120000 });

			collector.on('collect', (m) => {
				var { id, member } = utils.getMember(m, m.content.trim().split(' ')[0]);
				if (id != undefined && member != undefined) {
					info.dcID = id;
					info.member = member;
					this.editInfo(message);
					collector.stop('member found');
				} else {
					message.channel.send('member not found, please try again');
				}
			});

			collector.on('end', (collected) => {});
		}
	},
	async editInfo(message) {
		var currInfoMsg = await message.channel.send(this.buildLatestInfo());
		message.channel.send(
			`To change the info, type \`\`name:value\`\` e.g. \`\`email:nice@mail.com\`\` or \`\`igID:123456\`\`, the first letter is always small\r\nUse \`\`ok\`\` or \`\`continue\`\` to continue and \`\`cancel\`\` or \`\`stop\`\` to stop`
		);

		const filter = (response) => {
			return response.author.id === message.author.id;
		};
		const collector = message.channel.createMessageCollector(filter, { time: 300000 });

		collector.on('collect', (m) => {
			if (m.content == 'ok' || m.content == 'continue') {
				collector.stop('ok');
			} else if (m.content == 'cancel' || m.content == 'stop') {
				collector.stop('cancelled');
			}
			var args = m.content.split(':');

			if (args.length > 1) {
				var key = args[0],
					value = args[1];
				if (key in info) {
					if (key == 'dcID' || key == 'member') {
						var { id, member } = utils.getMember(m, value);
						info.dcID = id;
						info.member = member;
						currInfoMsg.edit(this.buildLatestInfo());
					} else {
						info[key] = value;
						currInfoMsg.edit(this.buildLatestInfo());
					}
				}
			}
		});

		collector.on('end', (collected, reason) => {
			console.log(reason);
			if (reason == 'ok') {
				this.addToStaffList(message);
			} else if (reson == 'cancelled') {
				return;
			}
		});
	},
	buildLatestInfo() {
		return new Discord.MessageEmbed()
			.setTitle('Current Info')
			.addField('Name', info.name, true)
			.addField('igID', info.igID, true)
			.addField('Email', info.email, true)
			.addField('Rank', info.rank, true)
			.addField('dcID', info.dcID, true)
			.addField('dcTag', info.dcTag, true)
			.addField('Department', info.department, true)
			.addField('Date', info.date, true)
			.addField('Member', `<@${info.member.id}>`, true)
			.setThumbnail(info.member.user.displayAvatarURL({ dynamic: true }));
	},
	async addToStaffList(message) {
		try {
			infoMsg = await message.channel.send('Continuing...');
			var res = await axios.post(webapp, {
				key: secretKey,
				action: 'add_to_staff_list',
				name: info.name,
				igID: info.igID,
				email: info.email,
				dcID: info.dcID,
				rank: info.rank,
				date: info.date
			});

			if (res.data.state == 'success') {
				infoMsg.edit(`${infoMsg.content}, added to Staff List`);
				await this.addDiscordRoles(message);
			} else {
				console.log(res.data);
			}
		} catch (err) {
			console.log(err);
		}
	},
	async addDiscordRoles(message) {
		var dep = info.department.toLowerCase();
		var rolesToAdd = [roles.trainee, roles.staff];
		var permsToAdd;

		if (dep == 'both') {
			rolesToAdd.push(roles.tokens);
			rolesToAdd.push(roles.cargo);
			permsToAdd = 'both';
		} else if (dep == 'bonus exp tokens') {
			rolesToAdd.push(roles.tokens);
			permsToAdd = 'tokens';
		} else if (dep == 'trucking') {
			rolesToAdd.push(roles.cargo);
			permsToAdd = 'cargo';
		}

		await info.member.roles.add(rolesToAdd);
		infoMsg.edit(`${infoMsg.content}, added discord roles`);

		await this.addPerms(message, permsToAdd);
	},
	async addPerms(message, permsToAdd) {
		await updateroles.execute(message, [info.member.id], false);
		infoMsg.edit(`${infoMsg.content}, updated roles list`);

		await perms.execute(message, ['add', permsToAdd, info.member.id], false);
		infoMsg.edit(`${infoMsg.content}, added sheet permissions`);

		await this.sendWelcomeMessages();
	},
	async sendWelcomeMessages() {
		var department = info.department.toLowerCase();

		if (department == 'bonus exp tokens') {
			department = 'our Bonus EXP department';
		} else if (department == 'trucking') {
			department = 'our Cargo department';
		} else if (department == 'both') {
			department = 'both of our departments';
		}

		var loungeMsg = `Please Whalecum 🐳 <@${info.member.id}> to the TX Family! They will be helping us in ${department}!!!\r\nhttps://tenor.com/view/whale-hellothere-hello-hi-hey-gif-4505186`;
		var traineeLoungeMsg = `<@${info.member.id}> If you have any questions, feel free to ask in here. Make sure to check pinned messages and read through the trainee guide!`;

		await info.member.guild.channels.resolve(channels.lounge).send(loungeMsg);
		await info.member.guild.channels.resolve(channels.traineeLounge).send(traineeLoungeMsg);

		appMsg.react('577181847767744523');
		infoMsg.edit(`${infoMsg.content}, sent welcome messages. Member hired successfully.`);
	}
};
