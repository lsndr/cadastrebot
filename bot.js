require('dotenv').config();

const Telegraf = require('telegraf');
const TelegrafFlow = require('telegraf-flow');

const app = new Telegraf(process.env.BOT_TOKEN, {username: process.env.BOT_USERNAME});
const flow = new TelegrafFlow();

require('./modules/find')(app, flow);

app.use(Telegraf.memorySession({getSessionKey: (ctx) => ctx.from.id}));
app.use(flow.middleware());

require('./modules/unknown')(app, flow);

if(process.env.BOT_UPDATES == 'WEBHOOK') {
    setTimeout(() => {
        app.webhookReply = true;
        app.telegram.setWebhook(process.env.BOT_WEBHOOK_URL, undefined, undefined, ['message','callback_query']);
        app.startWebhook(process.env.BOT_WEBHOOK_SERVER_PATH, null, process.env.BOT_WEBHOOK_SERVER_PORT, process.env.BOT_WEBHOOK_SERVER_HOST);
    }, process.env.BOT_WEBHOOK_START_DELAY || 1);
} else {
	app.telegram.deleteWebhook();
	app.startPolling();
}
