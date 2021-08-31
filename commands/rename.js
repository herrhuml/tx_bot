const { axios, webapp, secretKey } = require('../utils/imports');
const utils = require('../utils/utils');

module.exports = {
	name: 'rename',
	async execute(message, args) {
		var searchForType = null;
		var searchForVal = null;
		var splitArgs = message.content.split('"');

		if (args.length >= 2) {
			var author = message.member;
			if (!utils.hasRole(author, 'managers')) {
				message.channel.send(`You don't have permission to use this command.`);
				return;
			}

			var { id, member } = utils.getMember(message, args[0]);
			if (id != null) {
				searchForVal = vals.id;
				searchForType = 'dcID';
				newName = splitArgs[1];
			} else {
				searchForVal = splitArgs[1];
				searchForType = 'name';
				newName = splitArgs[3];
			}

			console.log(searchForVal + ' | ' + searchForType + ' | ' + newName);
			try {
				var res = await axios.post(webapp, {
					key: secretKey,
					searchForType: searchForType,
					searchForVal: searchForVal,
					newName: newName,
					action: 'rename'
				});
				console.log(res.data.state);
				console.log(res.data.message);
				if (res.data.state == 'success') {
					message.channel.send(res.data.message);
				} else {
					message.channel.send('an error occured');
				}
			} catch (err) {
				console.error(err);
			}
		}
	}
};
