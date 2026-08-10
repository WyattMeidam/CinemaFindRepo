'use strict';
const express = require('express');
const app = express();
app.use(express.json());

const SHOWTIMES = {
  'toy story 5': [
    { theater: 'AMC', time: '6:30 PM' },
    { theater: 'AMC', time: '9:00 PM' },
  ],
  obsession: [
    { theater: 'Regal City Center', time: '6:00 PM' },
    { theater: 'Cinemark', time: '6:00 PM' },
  ],
  'super girl': [{ theater: 'Cinemark', time: '8:15 PM' }],
  'the invite': [{ theater: 'Cinemark', time: '7:00 PM' }],
  // 'minecraft' left out on purpose
};

const THEATERS_BY_CITY = {
  portland: [
    { title: 'Toy Story 5', theater: 'AMC', genre: 'animation' },
    { title: 'Obsession', theater: 'Regal City Center', genre: 'thriller' },
  ],
  seattle: [
    { title: 'Obsession', theater: 'Cinemark', genre: 'thriller' },
    { title: 'Super Girl', theater: 'Cinemark', genre: 'action' },
    { title: 'The Invite', theater: 'Cinemark', genre: 'horror' },
  ],
  // 'austin' and 'chicago' left out on purpose
};

function getShowtimes(movieRaw) {
  const movie = (movieRaw || '').toLowerCase();
  if (!movie) return 'What movie would you like to check showtimes for?';
  const showtimes = SHOWTIMES[movie];
  if (!showtimes) {
    return `${movieRaw} does not appear to be playing at any nearby theaters right now. Would you like to check a different movie?`;
  }
  let speech = `${movieRaw} is playing at `;
  showtimes.forEach((s) => { speech += `${s.theater} at ${s.time}, `; });
  speech += 'Would you like to search for another movie, or check what else is playing near you?';
  return speech;
}

function findTheatersByLocation(cityRaw, genreRaw) {
  const city = (cityRaw || '').toLowerCase();
  const genre = (genreRaw || '').toLowerCase();
  if (!city) return 'Which city would you like me to search?';
  let results = THEATERS_BY_CITY[city] || [];
  if (genre) results = results.filter((r) => r.genre === genre);
  if (results.length === 0) {
    if (!genre) return `I couldn't find any theaters showing movies in ${cityRaw} right now. Would you like to try a different city?`;
    return `I couldn't find any ${genreRaw} movies playing in ${cityRaw} right now. Would you like to try a different genre or city?`;
  }
  let speech = genre
    ? `In ${cityRaw}, here are the ${genreRaw} movies playing: `
    : `In ${cityRaw}, here's what's playing: `;
  results.forEach((r) => { speech += `${r.title} at ${r.theater}, `; });
  speech += 'Would you like showtimes for any of these?';
  return speech;
}

app.post('/webhook', (req, res) => {
  try {
    const intentName = req.body.queryResult.intent.displayName;
    const params = req.body.queryResult.parameters || {};
    let fulfillmentText = "Sorry, I didn't get that.";
    if (intentName === 'GetShowtimesIntent') {
      fulfillmentText = getShowtimes(params.MovieTitle);
    } else if (intentName === 'FindTheatersByLocationIntent') {
      fulfillmentText = findTheatersByLocation(params.City, params.Genre);
    }
    res.json({ fulfillmentText });
  } catch (err) {
    console.error(err);
    res.status(200).json({ fulfillmentText: 'Something went wrong on my end.' });
  }
});
app.get('/', (req, res) => res.send('CinemaFind webhook is running.'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CinemaFind webhook listening on port ${PORT}`));
