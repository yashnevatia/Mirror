/* File that makes get request to API.AI with text */

// NPM Imports
const axios = require('axios');

// Necessary Tokens
const API_URL_BASE = 'https://api.api.ai/v1/';
const CLIENT_ACCESS_TOKEN = process.env.API_CLIENT_ACCESS_TOKEN || '';

console.log('client: ', CLIENT_ACCESS_TOKEN);

// Global Variables
const api_ai = axios.create({
  baseURL: API_URL_BASE,
  headers: {'Authorization': 'Bearer ' + CLIENT_ACCESS_TOKEN}
});

// Local Helper Function
// Generates the url to sent to API.AI
function generateQueryString(query, id) {
  return '/query?v=20150910&lang=en&sessionId=' + id + '&query=' + encodeURIComponent(query);
}

// Exported Function
// nlp.sendQuery(query, slackId)
//  - Param: widgetID -> String
//           query   -> String
//  - Description: Send an API call to API.AI
//    using the query string and slackId specified
function sendQuery(query, widgetID) {
  return api_ai.get(generateQueryString(query, widgetID))
}

module.exports = {
  sendQuery
}
