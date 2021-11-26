async function getResults(term, artist) {
	const tokenid = 'X93Z16kFrX8jRZ0l';
	const uid = '9460';

	const url = `https://www.abbreviations.com/services/v2/lyrics.php?uid=${uid}&tokenid=${tokenid}&term=${term}&artist=${artist}&format=json`;

	try {
		const response = await fetch(url);
		const results = await response.json();

		if (results.error)
			throw new Error(results.error);

		if (!results.result)
			throw new Error('Not found!');

		return results.result;
	} catch (e) {
		return {error: e.message};		
	}

}

async function getLyric(url) {
	const response = await fetch(url);
	const text = await response.text();
	const doc = document.implementation.createHTMLDocument('lyrics');

	doc.write(text);

	return {
				song: doc.querySelector('#lyric-title-text').innerText,
				year: doc.querySelector('dd a').innerText,
				artist: doc.querySelector('.lyric-artist a').innerText,
				lyrics: doc.querySelector('pre').innerText,
				avatar: doc.querySelector('#featured-artist-avatar a img')
			};

}


function updateLyric(result) {
	document.querySelector('.lyric').innerText = result.lyrics;
	document.querySelector('.card img').src = result.avatar.src;
	document.querySelector('.card-title').innerText = result.artist;
	document.querySelector('.card-text').innerText = result.song;
	document.querySelector('.card-year').innerText = result.year;
}

function updateLinks(results) {
	let others = '';

	results.forEach(item => {
		others += `<li class="list-group-item"><a href="${item['song-link']}">${item.artist} - ${item.song}</a></li>`;
	});

	document.querySelector('.list-group').innerHTML = others;
}

async function request(song, artist) {
	const lyric = document.querySelector('.lyric');

	lyric.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden"></span></div>';

	let results = await getResults(song, artist);

	if (results.error)
		return lyric.innerText = results.error;


	results = results
					.sort((x, y) => x.artist < y.artist ? -1 : 1)
					.filter((e, i, a) => (i == 0) || (i > 0 && e.artist != a[i-1].artist));

	const result = await getLyric(results[0]['song-link']);

	updateLyric(result);
	updateLinks(results);
}

document.addEventListener('DOMContentLoaded', evt => {

	const form = document.querySelector('form');

	form.addEventListener('submit', e => {
		e.preventDefault();
		
		const song = document.querySelector('#song').value;
		const artist = document.querySelector('#artist').value;

		request(song, artist);
	});


	document.querySelector('.list-group').addEventListener('click', e => {
		e.preventDefault();

		if (e.target.tagName === 'A')
			getLyric(e.target.href).then(updateLyric);
	});
});
