const { orderInfoCache, orderIDregex } = require('../utils/imports');
const orderIDRegexp = new RegExp(orderIDregex, 'i');

module.exports = {
	name: 'ready',
	async execute(message, args) {
		await orderInfoCache.init();

		var ordersObj = [];
		var orderObj;
		var orders = args.slice(1);
		var filteredOrders = orders.filter((el) => el.match(orderIDregex) != null);
		console.log(filteredOrders);

		filteredOrders.forEach((o) => {
			orderObj = { id: o, state: '' };
			ordersObj.push(orderObj);
		});

		let plural = ['', 'is'];
		if (filteredOrders.length > 1) {
			plural = ['s', 'are'];
		}

		var msg = await message.channel.send(`${message.mentions.members.first()} your order${plural[0]} **${filteredOrders.join(', ')}** ${plural[1]} ready to be collected! Please DM ${message.author} for collection timing.`);

		await orderInfoCache.setItem(msg.id, ordersObj, { ttl: 1000 * 60 * 60 * 24 * 14 });
	}
};
