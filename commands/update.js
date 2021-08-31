const { axios, secretKey, orderIDregex, webapp, cache } = require('../utils/imports');

module.exports = {
	name: 'update',
	async execute(message, args) {
		await cache.init();
		var val = await cache.getItem(message.member.id);

		if (val == undefined && args[0].match(orderIDregex)) {
			var name;
			try {
				var res = await axios.post(webapp, {
					key: secretKey,
					id: message.member.id,
					action: 'get_worker_name'
				});

				if (res.data.state == 'success') {
					console.log(res.data.message);
					name = res.data.message;
				}
			} catch (err) {
				console.error(err);
			}

			var obj = { orderId: args[0], name: name };
			await cache.setItem(message.member.id, obj);
			val = await cache.getItem(message.member.id);
		}

		if (args.length > 1 && args[0].match(orderIDregex)) {
			var name;
			try {
				var res = await axios.post(webapp, {
					key: secretKey,
					id: message.member.id,
					action: 'get_worker_name'
				});
				if (res.data.state == 'success') {
					console.log(res.data.message);
					name = res.data.message;
				}
			} catch (err) {
				console.error(err);
			}

			var obj = { orderId: args[0], name: name };
			await cache.setItem(message.member.id, obj);
			val = await cache.getItem(message.member.id);
		}

		var orderId = val.orderId;
		var name = val.name;
		var amount;

		if (args.length > 1) {
			amount = args[1];
		} else {
			amount = args[0];
		}

		try {
			var res = await axios.post(webapp, {
				key: secretKey,
				order: orderId,
				name: name,
				amount: amount,
				action: 'update_amount'
			});

			console.log(res.data.state);
			console.log(res.data.message);
			if (res.data.state == 'success') {
				message.channel.send(`order **${orderId}** amount updated to **${amount}**`);
			} else if (res.data.state == 'error5') {
				message.channel.send(res.data.message);
			}
		} catch (err) {
			console.error(err);
		}
	}
};
