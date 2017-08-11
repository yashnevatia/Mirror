const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { localGetCommand } = require('./processHuman');
// todo imports
//const Reminder = require('./models/models').Reminder;
// twilio imports
const accountSid = process.env.TWILIO_SID; // Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN; // Auth Token from www.twilio.com/console
const twilio = require('twilio');
const client = new twilio(accountSid, authToken);
const FROM_NUMBER = process.env.MY_TWILIO_NUMBER; // custom Twilio number
const TO_NUMBER = process.env.MY_PHONE_NUMBER; // telephone number to text; format: +1234567890

/*------------------- ToDo Routes -----------------------*/

/*router.get('/todo', (req, res) => {
    //get all the ToDo's from database and return them when pushed into an array --> set this.setState with it
    Remider.find()
    .then((resp) =>{
        console.log("mounting",resp);
        res.send(resp)
    })
})

router.post('/todo', (req, res) => {
    //create new Reminder form model and store it in DB
    var r = new Reminder({
        task: req.body.task
    })
    //save to database
    r.save(function(err, reminder) {
      if (err) {
        console.log(err);
        res.status(500).send('fail');
        return;
      }
      console.log("adding", reminder)
      res.send(reminder);
    });
})

router.post('/deltodo', (req, res) => {
    Remider.find()
    .then((resp) =>{
        newResp = resp.slice(req.body.task, 1)
        console.log("mounting",resp);
        res.send(newResp)
    })
});*/

/*------------------- INSERT Uber Routes -----------------------*/



/*------------------- News Routes -----------------------*/

//use twilio to send article link to phone via text
router.post('/sendArticle', (req, res) => {
  client.messages.create({
    body: req.body.link,
    to: TO_NUMBER,  // Text this number
    from: FROM_NUMBER // From a valid Twilio number
  })
  .then( msg => {
    console.log('SERVER sent msg:', msg);
  });

})

module.exports = router;
