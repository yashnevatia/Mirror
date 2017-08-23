
const axios = require( 'axios');

function getCurrentWeather (cityId, WEATHER_API) {
  let link = 'http://api.openweathermap.org/data/2.5/weather?';
  link += `id=${cityId}`;             // id for city for which you want weather
  link += '&units=imperial';          // comment out for Celsius; leave here for Fahrenheit
  link += `&APPID=${WEATHER_API}`;    // personal weather api key

  return axios.get(link);
}

function getForecastWeather (cityId, WEATHER_API) {
  let link = 'http://api.openweathermap.org/data/2.5/forecast/?';
  link += `id=${cityId}`;             // id for city for which you want weather
  link += '&units=imperial';          // comment out for Celsius; leave here for Fahrenheit
  link += `&APPID=${WEATHER_API}`;    // personal weather api key

  return axios.get(link);
}

module.exports = { getCurrentWeather, getForecastWeather }
