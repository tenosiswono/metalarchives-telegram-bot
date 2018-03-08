const Telegraf = require('telegraf');
const RedisSession = require('telegraf-session-redis');
const TelegrafI18n = require('telegraf-i18n');
const bluebird = require('bluebird');
const mongoose = require('mongoose');
const path = require('path');

require('./src/models');
const config = require('./config');
const handlers = require('./src/handlers');
const middlewares = require('./src/middlewares');

const bot = new Telegraf(config.botToken, { username: config.botUsername });
const redisSession = new RedisSession({
  store: { url: config.redisUrl },
});
const telegrafI18n = new TelegrafI18n({
  directory: path.resolve(__dirname, 'config/locales'),
  defaultLanguage: 'en',
  useSession: true,
});

mongoose.Promise = bluebird;
mongoose.connect(config.mongoUrl, { useMongoClient: true });

bot.use(redisSession.middleware());
bot.use(telegrafI18n.middleware());
bot.use(middlewares);
bot.use(handlers.commands, handlers.messages, handlers.other);

bot.catch((err) => {
  console.error(err);
});

bot.startPolling();
