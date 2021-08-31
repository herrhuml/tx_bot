const { Discord, helpcmds, prefix } = require('../utils/imports');

module.exports = {
	name: 'help',
	execute(message, args) {
		if (args.length == 0) {
			var workerCommads = '';
			var collectorCommands = '';
			var managerCommands = '';

			//console.log(helpcmds.worker.stats);
			for (var el in helpcmds.worker) {
				workerCommads += '``' + helpcmds.worker[el].cmd + '``: ' + helpcmds.worker[el].desc_short + '\r\n';
			}

			for (var el in helpcmds.collector) {
				collectorCommands += '``' + helpcmds.collector[el].cmd + '``: ' + helpcmds.collector[el].desc_short + '\r\n';
			}

			for (var el in helpcmds.manager) {
				managerCommands += '``' + helpcmds.manager[el].cmd + '``: ' + helpcmds.manager[el].desc_short + '\r\n';
			}

			var embed = new Discord.MessageEmbed()
				.setTitle(`Command List`)
				.setDescription(`prefix: \`\`${prefix}\`\`\r\n\r\n` + '**worker commands**\r\n' + workerCommads + '\r\n' + '**collector commands**\r\n' + collectorCommands + '\r\n' + '**manager commands**\r\n' + managerCommands)
				.setFooter(`for more help type ${prefix}help {command}`);
			message.channel.send(embed);
		} else if (args.length > 0) {
			try {
				var cmdSearch = args[0];
				var command = null;
				if (helpcmds.worker[cmdSearch] != null) {
					command = helpcmds.worker[cmdSearch];
				} else if (helpcmds.collector[cmdSearch] != null) {
					command = helpcmds.collector[cmdSearch];
				} else if (helpcmds.manager[cmdSearch] != null) {
					command = helpcmds.manager[cmdSearch];
				} else {
					message.channel.send('command not found');
				}

				if (command != null) {
					var desc = command.desc_long;
					var usage = command.usage;
					var example = command.example;
					var embed = new Discord.MessageEmbed().setTitle(`${command.cmd}`).setDescription(desc + '\r\n\r\n' + '**use:**\r\n' + usage + '\r\n\r\n' + '**example:**\r\n' + example);
					message.channel.send(embed);
				}
			} catch (err) {
				console.error(err);
			}
		}
	}
};
