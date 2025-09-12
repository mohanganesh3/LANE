/**
 * SMS Service Configuration
 * Uses Twilio for SMS notifications
 */

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Test connection
client.api.accounts(accountSid)
    .fetch()
    .then(() => console.log('✅ Twilio SMS service connected'))
    .catch(err => console.error('❌ Twilio connection error:', err.message));

module.exports = { client, twilioPhone };
