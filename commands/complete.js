const { orderInfoCache } = require('../utils/imports');

module.exports = {
	name: 'complete',
	async execute(message, args) {
		await orderInfoCache.init();
		var msg = null;
		var msgsToEdit = [];
		var filteredMsgs = [];
		await orderInfoCache.forEach(async function(datum){
			var val = datum.value;
			var key = datum.key;
			for (var v in val) {
				for (var a in args) {
					if (val[v].id == args[a]) {
						msgsToEdit.push(key);
					}
				}
			}
		});

		filteredMsgs = msgsToEdit.filter((value, index, self) => self.indexOf(value) === index);

		filteredMsgs.forEach(async function(msg){
			var originalMessage = await message.channel.messages.fetch(msg);
			var ordersObj = await orderInfoCache.getItem(msg);
			var newOrders = [];

			ordersObj.forEach((order) => {
				args.forEach((arg) => {
					if (order.id == arg) {
						order.state = 'complete';
					}
				});
			});

			var allReceived = true;
			ordersObj.forEach((order) => {
				if (order.state != 'complete') {
					allReceived = false;
				}
			});

			var allReceivedString = '';
			if (allReceived) {
				ordersObj.forEach((order) => {
					newOrders.push(order.id);
				});
				allReceivedString = '<:received:550698922637524992> ';
			} else {
				ordersObj.forEach((order) => {
					if (order.state == 'complete') {
						newOrders.push(`<:received:550698922637524992>${order.id}`);
					} else {
						newOrders.push(order.id);
					}
				});
			}

			await orderInfoCache.updateItem(msg, ordersObj);

			var originalSplit = originalMessage.content.split('**');
			var newMessage = `${allReceivedString}${originalSplit[0]}**${newOrders.join(', ')}**${originalSplit[2]}`;

			await originalMessage.edit(newMessage);
		});
	}
};
