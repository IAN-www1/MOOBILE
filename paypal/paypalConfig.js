// paypalConfig.js

const paypal = require('@paypal/checkout-server-sdk');

const clientId = 'ATT4YpGIP9EnDmtoh5CYvDUOR8gPA7Axy-R2jAR3u1CcrknJTBI7NQY642f5AVwfyoLIaL4sOkPloQQq';
const clientSecret = 'EIIjajZFvt8VXT8qOjjNPWUzqJ0k-arxGhWapuMcL8nzqKfWcbdvcHAWHgQSWbuIwV5VCxR6246NEdQb';

// Set up PayPal environment
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;
