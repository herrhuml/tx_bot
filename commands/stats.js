const { Discord, axios, webapp, secretKey } = require('../utils/imports');
const utils = require('../utils/utils');

module.exports = {
	name: 'stats',
	async execute(message, args) {
		let uid;

		var { id, member } = utils.getMember(message, args[0]);
		if (id != null) {
			uid = id;
		} else {
			uid = message.author.id;
		}
		try {
			var res = await axios.post(webapp, {
				key: secretKey,
				id: uid,
				action: 'get_worker_stats'
			});

			console.log(res.data.state);
			console.log(res.data.message);
			if (res.data.state == 'success') {
				var baseStats = res.data.message[0];
				var bonusExpStats = res.data.message[1];
				var vouchersStats = res.data.message[2];
				var cargoStats = res.data.message[3];

				var baseBlock = '';
				var bonusExpBlock = '';
				var vouchersBlock = '';
				var cargoBlock = '';
				var stringLength = 30;
				var pad = 30;
				var temp = '';

				var money = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(baseStats[1][0]).split('.')[0];
				var orders = Intl.NumberFormat('en-US').format(baseStats[1][1]).split('.')[0];

				// pad money earned, add to code block
				temp = 'Money Earned:';
				pad = stringLength - money.length;
				temp = temp.padEnd(pad, ' ') + money;
				baseBlock += temp;

				// pad money earned, add to code block
				temp = 'Orders Completed:';
				pad = stringLength - orders.length;
				temp = temp.padEnd(pad, ' ') + orders;
				baseBlock += '\n' + temp;

				baseBlock = `\`\`\`${baseBlock}\`\`\``;

				/* BonusExp Stats */
				if (bonusExpStats.length > 1) {
					bonusExpBlock += 'Type                   Grinded\n-----                 --------';
					for (let i = 1; i < bonusExpStats.length; i++) {
						temp = bonusExpStats[i][0];
						var amount = Intl.NumberFormat('en-US').format(bonusExpStats[i][1]);
						pad = stringLength - amount.length;
						bonusExpBlock += '\n' + temp.padEnd(pad, ' ') + amount;
					}
					bonusExpBlock = `**Bonus EXP**\`\`\`${bonusExpBlock}\`\`\``;
				}

				/* Vouchers Stats */
				if (vouchersStats.length > 1) {
					vouchersBlock += 'Type                   Grinded\n-----                 --------';
					for (let i = 1; i < vouchersStats.length; i++) {
						temp = vouchersStats[i][0];
						var amount = Intl.NumberFormat('en-US').format(vouchersStats[i][1]);
						pad = stringLength - amount.length;
						vouchersBlock += '\n' + temp.padEnd(pad, ' ') + amount;
					}
					vouchersBlock = `**Vouchers**\`\`\`${vouchersBlock}\`\`\``;
				}

				/* Cargo Stats */
				if (cargoStats.length > 1) {
					cargoBlock += 'Type                   Grinded\n-----                 --------';
					for (let i = 1; i < cargoStats.length; i++) {
						temp = cargoStats[i][0];
						var amount = Intl.NumberFormat('en-US').format(cargoStats[i][1]);
						pad = stringLength - amount.length;
						cargoBlock += '\n' + temp.padEnd(pad, ' ') + amount;
					}
					cargoBlock = `**Cargo**\`\`\`${cargoBlock}\`\`\``;
				}

				var statsString = `**Base Info**\n${baseBlock}${bonusExpBlock}${vouchersBlock}${cargoBlock}`;

				let embed = new Discord.MessageEmbed().setDescription(`Stats for <@${uid}>\n${statsString}`).setColor('#0066ff');

				message.channel.send(embed);
			}
		} catch (error) {
			console.error(error);
		}
	}
};
