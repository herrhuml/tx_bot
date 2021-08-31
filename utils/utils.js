const { roles } = require('./imports');

module.exports = {
	getMember(message, mention) {
		var id = null,
			matches = null,
			member = null;
		if (mention != undefined) {
			matches = mention.match(/^<@!?(\d+)>$/);

			if (matches != null) {
				id = matches[1];
			} else {
				matches = mention.match(/^(\d+)$/);
				if (matches != null) {
					id = matches[0];
				}
			}

			member = message.guild.members.cache.get(id);
		}
		return { id, member };
	},
	hasRole(member, roleNeeded) {
		if (member.roles.cache.some((role) => roles[roleNeeded].includes(role.id))) {
			return true;
		} else {
			return false;
		}
	},
	currentDate() {
		let now = new Date(Date.now());
		let day = now.getDate();
		if (day < 10) {
			day = '0' + day;
		}
		let month = now.getMonth() + 1;
		if (month < 10) {
			month = '0' + month;
		}
		let year = now.getFullYear();
		let date = day + '.' + month + '.' + year;

		return date;
	}
};
