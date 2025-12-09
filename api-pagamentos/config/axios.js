const axios = require("axios");

const api = axios.create({
  baseURL: process.env.ORDER_API_URL || 'http://api-pedidos:3004',
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = api;