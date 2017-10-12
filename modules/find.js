require('dotenv').config();

const request = require('request-promise');
const loadJsonFile = require('load-json-file');

let botan = require('botanio')(process.env.APPMETRIKA_TOKEN);

module.exports = (app, bot) => {
	bot.on('location', async (ctx) => {
		const codes = await loadJsonFile('./codes.json');

		await ctx.replyWithChatAction('typing');
		botan.track(ctx.message, 'Location');

		try {
			let res1 = JSON.parse(await request('https://pkk5.rosreestr.ru/api/features/1?text=' + ctx.message.location.latitude + ',' + ctx.message.location.longitude));
			let res2 = JSON.parse(await request('https://pkk5.rosreestr.ru/api/features/1/' + res1.features['0'].attrs.id));
		
			let data = '<b>' + res2.feature.attrs.address + '</b>\r\n\r\n';

			if(res2.feature.attrs.cn) {
				data += '<b>Кад. номер:</b> ' + res2.feature.attrs.cn + '\r\n'
			}

			if(res2.feature.attrs.cn) {
				data += '<b>Кад. квартал:</b> ' + res2.feature.attrs.kvartal_cn + '\r\n'
			}

			if(res2.feature.attrs.statecd && codes.parcel_states[res2.feature.attrs.statecd]) {
				data += '<b>Статус:</b> ' + codes.parcel_states[res2.feature.attrs.statecd] + '\r\n'
			}

			if(res2.feature.attrs.category_type && codes.category_types[res2.feature.attrs.category_type]) {
				data += '<b>Категория земель:</b> ' + codes.category_types[res2.feature.attrs.category_type] + '\r\n'
			}

			if(res2.feature.attrs.fp && codes.parcelOwnership[res2.feature.attrs.fp]) {
				data += '<b>Форма собственности:</b> ' + codes.parcelOwnership[res2.feature.attrs.fp] + '\r\n'
			}

			if(res2.feature.attrs.cad_unit && codes.cadastreUnits[res2.feature.attrs.cad_unit]) {
				data += '<b>Кадастровая стоимость:</b> ' + res2.feature.attrs.cad_cost + ' ' + codes.cadastreUnits[res2.feature.attrs.cad_unit] + '\r\n'
			}

			if(res2.feature.attrs.area_unit && codes.measurementUnits[res2.feature.attrs.area_unit]) {
				data += '<b>Уточненная площадь:</b> ' + res2.feature.attrs.area_value + ' ' + codes.measurementUnits[res2.feature.attrs.area_unit] + '\r\n'
			}

			if(res2.feature.attrs.util_code && codes.utilizations[res2.feature.attrs.util_code]) {
				data += '<b>Разрешенное использование:</b> ' + codes.utilizations[res2.feature.attrs.util_code] + '\r\n'
			}

			if(res2.feature.attrs.util_by_doc) {
				data += '<b>по документу:</b> ' + res2.feature.attrs.util_by_doc + '\r\n'
			}

			if(res2.feature.attrs.cad_eng_data && res2.feature.attrs.cad_eng_data.ci_first) {
				data += '<b>Кадастровый инженер:</b> ' + (res2.feature.attrs.cad_eng_data.ci_surname || '') + ' ' + res2.feature.attrs.cad_eng_data.ci_first + ' ' + (res2.feature.attrs.cad_eng_data.ci_patronymic || '') + '\r\n'
			}

			await ctx.reply(data, {parse_mode: 'HTML', reply_markup: {
				inline_keyboard: [
					[{text: 'Показать на карте', url: 'https://pkk5.rosreestr.ru/#x=' + res2.feature.center.x + '&y=' + res2.feature.center.y + '&z=20&text=' + ctx.message.location.latitude + ',' + ctx.message.location.longitude + '&type=1&app=search&opened=1'}]
				]
			}});

		} catch (e) {
			console.log(e);
			await ctx.reply('В базе нет информации по запрошенному объекту');
		}
		
	})
}
