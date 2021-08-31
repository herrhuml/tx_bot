const { axios, webapp, secretKey, orderIDregex } = require('../utils/imports');
const utils = require('../utils/utils');

module.exports = {
	name: 'add',
	async execute(message, args) {
		var author = message.member;
		if (!utils.hasRole(author, 'collector')) {
			message.channel.send(`You don't have permissions for that command`);
			return;
		}

		var orders = null;
		var { id, member } = utils.getMember(message, args[0]);
		if (member != null) {
			orders = args.slice(1);
		} else {
			member = author;
			orders = args;
		}

		var orderArray = [];
		orders.forEach((ord) => {
			if (ord.match(orderIDregex) != null) {
				orderArray.push(ord);
			}
		});
		ordersString = orderArray.join(', ');
		message.channel.send(ordersString);
		console.log(ordersString);
		console.log(member);
		console.log(orderArray);

		if (member != null && orders.length > 0) {
			var uid = member.id;
			try {
				var res = await axios.post(webapp, {
					key: secretKey,
					id: uid,
					action: 'add_order',
					orders: orderArray
				});

				console.log(res.data.state);
				console.log(res.data.message);

				if (res.data.state == 'success') {
					message.channel.send(`Order(s) **${ordersString}** added to worker **${member.displayName}**`);
				} else {
					message.channel.send(`an error occured while trying to add the orders`);
				}
			} catch (error) {
				console.error(error);
			}
		}
	}
};
