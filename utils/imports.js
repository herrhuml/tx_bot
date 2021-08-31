const debug = false;
const { prefix, botToken, secretKey, webapp, ipDict, dcIDregex, orderIDregex, roles, channels } = require('./config.json');

const Discord = require('discord.js');
const fs = require('fs');
const axios = require('axios');
const cache = require('node-persist');
const orderInfoCache = require('node-persist');
const helpcmds = require('./commands.json');

module.exports = {
	debug,
	prefix,
	botToken,
	secretKey,
	webapp,
	ipDict,
	dcIDregex,
	orderIDregex,
	roles,
	channels,

	Discord,
	fs,
	axios,
	cache,
	orderInfoCache,
	helpcmds
};
