const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Promise = require('bluebird');

const BASE_URL = 'https://search.azlyrics.com/?q=';

function makeSearchUrl(artistName, trackName) {
  return `${BASE_URL}${artistName.replace(/\s/g, '+')}+${trackName.replace(/\s/g, '+')}`;
}

function checkFetchStatus(response) {
  if (response.status !== 200 || !response.ok) {
    let error = new Error(response.statusText);
    error.response = response;
    return Promise.reject(error);
  }
  return Promise.resolve(response);
}

function getCheerioHtml(url) {
  return fetch(url)
    .then((response) => checkFetchStatus(response))
    .then((response) => response.text())
    .then((html) => cheerio.load(html));
}

function doesAzFoundAnyResult(html) {
  return html('div[class="alert alert-warning"]').length === 0;
}

function extractSongListFromTable(html) {
  const songs = [];
  const table = html('table[class="table table-condensed"] > tbody').first();
  const tableRows = table.children();
  const endOfTableIndex = tableRows.length - 1;

  tableRows.each(function (index, tableRow) {
    if (index < endOfTableIndex) {
      const tableData = tableRow.children[0];
      const aTag = tableData.children[1];
      const title = aTag.children[0];
      const artist = tableData.children[3];

      songs.push({
        title: html(title).text().replace(/"/g, '').toLowerCase(),
        url: html(aTag).attr('href'),
        artist: html(artist).text().toLowerCase(),
      });
    }
  });

  return songs;
}

function isSongDetailMatched(song, artistName, trackName) {
  return (
    (song.title.indexOf(trackName) !== -1 && song.artist.indexOf(artistName) !== -1) ||
    (trackName.indexOf(song.title) !== -1 && artistName.indexOf(song.artist))
  );
}

function selectSuitableTrackUrl(html, artistName, trackName) {
  let error = new Error('Does not found any result for the giving artist and track');

  if (doesAzFoundAnyResult(html)) {
    const foundedSongs = extractSongListFromTable(html);
    for (song of foundedSongs) {
      if (isSongDetailMatched(song, artistName, trackName)) {
        return Promise.resolve(song.url);
      }
    }
    error = new Error('Found results but not match for the giving artist and track');
  }

  return Promise.reject(error);
}

function extractLyrics(html) {
  const lyrics = html('div.col-xs-12.col-lg-8.text-center').find('div:not([class])').text();
  return Promise.resolve(lyrics);
}

function getLyricFrom(url, artistName, trackName) {
  return getCheerioHtml(url)
    .then((html) => selectSuitableTrackUrl(html, artistName, trackName))
    .then((selectedUrl) => getCheerioHtml(selectedUrl))
    .then((html) => extractLyrics(html))
    .catch((err) => {
      return Promise.reject(err);
    });
}

async function search(artistName, trackName) {
  const url = makeSearchUrl(artistName.trim(), trackName.trim());

  return getLyricFrom(url, artistName.trim(), trackName.trim());
}

module.exports = {
  search,
};
