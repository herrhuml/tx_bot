const { Discord, ipDict } = require('../utils/imports');

module.exports = {
	name: 'connect',
	execute(message, args) {
		if (args.length > 0) {
			var server = args[0].toUpperCase();
			var ip = ipDict[server];
			if (ip != null) {
				var embed = new Discord.MessageEmbed().setTitle(`connect to S${args[0]}`).addField('click', `<fivem://connect/${ip}>`).addField('via F8', `connect ${ip}`);
				message.channel.send(embed);
			} else {
				message.channel.send('Server not found');
			}
		} else {
			message.channel.send('Please specify a server');
		}
	}
};
