function sendMessage(link, sendToMom){

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

    /* NEW CHANGES - PROBABLY DELETE */
    if (sendToMom) {
      console.log('hit send to mom')
      return client.messages.create({
        body: link,
        to: '+17024960456',  // Text this number
        from: FROM_NUMBER // From a valid Twilio number
      })
    }
    else {
      return 'NO'
    }
    /* END NEW CHANGES */

    console.log('SERVER sent msg');
  })
  /* NEW CHANGES - PROBABLY DELETE */
  .then ( again => {
    if (again && again === 'NO') {
      console.log('server not send to mom')
    } else {
      console.log('SERVER SENT TO MOM')
    }
  })
  /* END NEW CHANGES */
	.catch( err => {
		console.log ('THIS IS WHERE YOU SEE THE ERR', err);
	})
}

module.exports = {
  sendMessage
}
