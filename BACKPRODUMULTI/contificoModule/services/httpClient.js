// services/httpClient.js
const axios = require('axios');
const API_CONFIG = require('../config/apiConfig');

const httpClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    Authorization: API_CONFIG.API_KEY,
  },
});

module.exports = httpClient;
