const axios = require("axios");

const api = axios.create({
  baseURL: process.env.ORDER_API_URL || 'http://localhost:3004',
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = api;