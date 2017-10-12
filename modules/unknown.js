require('dotenv').config();

let botan = require('botanio')(process.env.APPMETRIKA_TOKEN);

module.exports = (app, bot) => {
	app.use((ctx, next) => {
		return next().then(async () => {
			if(ctx.message) {
				botan.track(ctx.message, 'Unknown');

				await ctx.reply('Пришли мне геометку объекта, и я найду данные о нем в земельном кадастре');
			}
		})
	})
}
