const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Promise = require('bluebird');

function checkFetchStatus (response) {
	if (response.status !== 200 || !response.ok) {
			let error = new Error(response.statusText)
			error.response = response
			return Promise.reject(error)
	}
	return Promise.resolve(response)
}

function getCheerioHtml(url) {
	return fetch(url)
		.then(response => checkFetchStatus(response))
		.then(response => response.text())
		.then(html => cheerio.load(html))
}

function doesAzFoundAnyResult($) {
	return $('div[class="alert alert-warning"]').length === 0;
}

getCheerioHtml('https://search.azlyrics.com/?q=baby').then(res => {
	// console.log(res);

	if (doesAzFoundAnyResult(res)) {
		console.log('good');
		const table = res('table[class="table table-condensed"] > tbody').first();
		log(table.length);
		table.children().each(function(i, elm) {
			console.log(res(this).text()) // for testing do text() 
			log('here---')
		})
	} else {
		log(res('div[class="alert alert-warning"]').length);
		log(res('div[class="alert alert-warning"]').text());
	}
}).catch(console.log);

const log = (e) => console.log(e);