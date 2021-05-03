const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Promise = require('bluebird');

class Lyrics {
    /**
      * Search lyrics
      * @param {String} query Query you selected/searched
      * @returns {Promise<String>} The lyrics the API provided.
      **/
    async search(query) {
       await request(`https:///search.azlyrics.com/search.php?q=${query.replace(/\s/g, "+")}`, (err, body, res) => {
            const $ = cheerio.load(res);
            let lyricLink = $('div.col-xs-12.col-sm-offset-1.col-md-8.col-md-offset-2.text-center').find('div.panel').eq(2).find('td.text-left.visitedlyr').find('a').eq(0).attr('href');
            if(lyricLink === undefined) lyricLink = $('div.col-xs-12.col-sm-offset-1.col-md-8.col-md-offset-2.text-center').find('div.panel').eq(1).find('td.text-left.visitedlyr').find('a').eq(0).attr('href');
            if(lyricLink === undefined) lyricLink = $('div.col-xs-12.col-sm-offset-1.col-md-8.col-md-offset-2.text-center').find('div.panel').eq(0).find('td.text-left.visitedlyr').find('a').eq(0).attr('href');
            if(lyricLink === undefined) return "No lyrics found.";
           
            request(lyricLink, (e, ress, uwu) => {
                let artistt = o('div.col-xs-12.col-lg-8.text-center').find('div').eq(4).text().replace('Lyrics', '').replace('\n', '').replace('\n', '');
                let sung = o('div.col-xs-12.col-lg-8.text-center').find('div').eq(3).text().replace('lyrics', '').replace('"', '').replace('"', '');
                let lyrics = o('div.col-xs-12.col-lg-8.text-center').find('div').eq(6).text();
                
                const info = {
                     lyric: lyrics,
                     song: sung,
                     artist: artistt
                };
                
                return info;
            });
       });
    }
}

const BASE_URL = 'https://search.azlyrics.com/?q=';

function makeSearchUrl(artistName, trackName) {
	return `${BASE_URL}${artistName.replace(/\s/g, '+')}+${trackName.replace(/\s/g, '+')}`
}

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

function doesAzFoundAnyResult(html) {
	return html('div[class="alert alert-warning"]').length === 0;
}

function selectSuitableTrackUrl(html) {

	if (doesAzFoundAnyResult(html)) {
		// get result array
		// check each link
		// if one link ok
		// resolve the link
		// else reject 
	} else {
		const error = new Error('azlyrics does not found any result for giving artist and track');
		return Promise.reject(error)
	}
}

function extractLyrics(html) {
	// html selector
	// resovle text
}

function getLyricFrom(url) {

	return getCheerioHtml(url)
		.then(html => selectSuitableTrackUrl(html))
		.then(selectedUrl => getCheerioHtml(selectedUrl))
		.then(html => extractLyrics(html))
		.catch(err => {
			return Promise.reject(err);
		});
}

async function search (artistName, trackName) {
	const url = makeSearchUrl(artistName.trim(), trackName.trim());

	return getLyricFrom(url);
}

module.exports = {
	search
};
