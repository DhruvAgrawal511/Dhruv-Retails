const axios = require('axios');

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION;

const shopify = axios.create({
  baseURL: `https://${storeDomain}/admin/api/${apiVersion}/`,
  headers: {
    "X-Shopify-Access-Token": accessToken,
    "Content-Type": "application/json"
  }
});

module.exports = shopify;
