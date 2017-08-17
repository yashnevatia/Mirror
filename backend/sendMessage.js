function sendMessage(link){

  const accountSid = process.env.TWILIO_SID; // Account SID from www.twilio.com/console
  const authToken = process.env.TWILIO_AUTH_TOKEN; // Auth Token from www.twilio.com/console
  const twilio = require('twilio');
  const client = require('twilio')(accountSid, authToken);
  const FROM_NUMBER = process.env.MY_TWILIO_NUMBER; // custom Twilio number
  const TO_NUMBER = process.env.MY_PHONE_NUMBER; // telephone number to text; format: +1234567890

  console.log('SERVER in send article: ', TO_NUMBER, FROM_NUMBER, link);
  client.messages.create({
    body: link,
    to: TO_NUMBER,  // Text this number
    from: FROM_NUMBER // From a valid Twilio number
  })
  .then( msg => {
    console.log('SERVER sent msg');
  })
	.catch( err => {
		console.log ('THIS IS WHERE YOU SEE THE ERR', err);
	})
}

module.exports = {
  sendMessage
}
