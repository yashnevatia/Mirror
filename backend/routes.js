const express = require('express');
const Uber = require('node-uber');
const router = express.Router();
const bodyParser = require('body-parser');
const { localGetCommand } = require('./processHuman');
// todo imports
//const mongoose = require('mongoose');
//const mongoose = require('mongoose');
const Reminder = require('./models/models').Reminder;
// twilio imports
const accountSid = process.env.TWILIO_SID; // Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN; // Auth Token from www.twilio.com/console
const twilio = require('twilio');
const client = require('twilio')(accountSid, authToken);
// const client = new twilio(accountSid, authToken);
const FROM_NUMBER = process.env.MY_TWILIO_NUMBER; // custom Twilio number
const TO_NUMBER = process.env.MY_PHONE_NUMBER; // telephone number to text; format: +1234567890


router.get('/',(req,res) => {
	console.log("thanks");
	res.send(200);
})

/*------------------- Reminder Routes -----------------------*/

router.get('/todo', (req, res) => {
    //get all the ToDo's from database and return them when pushed into an array --> set this.setState with it
    Reminder.find()
    .then((resp) =>{
        console.log("mounting",resp);
        res.send(resp)
    })

})

router.post('/todo', (req, res) => {
  //create new Reminder form model and store it in DB
  console.log('in post route add todo');
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

  console.log('in post route remove todo');
	// CHECK WHETHER THIS WORKS
  /*Reminder.find()
  .then((resp) =>{
    newResp = resp.slice(parseInt(req.body.task), 1)
    console.log("mounting",resp);
    res.send(newResp)
  })
});*/
	// OR IF THIS WORKS
    Reminder.remove({task: req.body.task})
    .then(() =>{
        Remider.find()
        .then((resp) => {
            console.log("deleted", resp);
            res.send(resp)
        })
    })

});


/*------------------- Uber Routes -----------------------*/

// initialize node-uber
const uber = new Uber({
  client_id: process.env.UBER_CLIENT_ID,
  client_secret: process.env.UBER_CLIENT_SECRET,
  server_token: process.env.UBER_SERVER_TOKEN,
  redirect_uri: 'http://localhost:3000/callback',
  name: 'IRIS',
  language: 'en_US', // optional, defaults to en_US
  sandbox: true // optional, defaults to false
});

// CONFIG & AUTH FOR UBER (do this on each new computer to log in)
router.get('/login', function(req, res) {
  var url = uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
  res.redirect(url);
});


router.get('/callback', function(req, res) {
  uber.authorizationAsync({ authorization_code: req.query.code })
  .spread(function(access_token, refresh_token, authorizedScopes, tokenExpiration) {
    // store the user id and associated access_token, refresh_token, scopes & token expiration date
    console.log('New access_token retrieved: ' + access_token);
    console.log('... token allows access to scopes: ' + authorizedScopes);
    console.log('... token is valid until: ' + tokenExpiration);
    console.log('... after token expiration, re-authorize using refresh_token: ' + refresh_token);
    // redirect the user back to actual app
    res.redirect('/');
  })
  .error(function(err) {
    console.error('ERROR:', err);
  });
});

// GET AVAILABLE PRODUCTS
router.get('/products', function(req, res) {
  let query = req.query
  uber.products.getAllForAddressAsync(query.pickup)
  .then(function(resp) {
    res.send(resp.products);
    uber.products.setDriversAvailabilityByIDAsync("26546650-e557-4a7b-86e7-6a3942445247", true);
  })
  .error(function(err) {
    console.error("could not get available products", err);
  });
})

// GET PRICE ESTIMATES
router.get('/price', function(req, res) {
  let query = req.query
  uber.estimates.getPriceForRouteByAddressAsync(query.pickup, query.destination)
  .then(function(resp) {
    res.send(resp);
  })
  .error(function(err) {
    console.error("could not get price estimate", err);
  });
})

// POST A RIDE REQUEST
router.post('/request', function(req, res) {
  uber.requests.createAsync({
    "product_id": "26546650-e557-4a7b-86e7-6a3942445247",
    "start_latitude": 37.761492,
    "start_longitude": -122.423941,
    "end_latitude": 37.775393,
    "end_longitude": -122.417546
    // "startAddress": req.query.home,
    // "endAddress": req.query.destination,
  })
  .then(function(resp) {
    console.log('POSTED UBER REQUEST!!')
    res.send(resp)
  })
  .error(function(err) {
    console.error('could not process your request rn', err);
  });
})

// PUT DRIVER STATUS
// note: defaults to processing, then set to 'accepted', then 'arriving', then 'in_progress'
router.put('/sandbox/status', function(req, res) {
  uber.requests.setStatusByIDAsync(req.query.request_id, req.query.status)
  .then(function(resp) {
    console.log('CHANGED SANDBOX STATUS TO' + req.query.status);
    if (req.query.status === 'accepted') {
      res.send('Your request has been accepted and a driver is en route to your location.')
    }
    if (req.query.status === 'arriving') {
      res.send('Your ride will be arriving soon.')
    }
  })
})

router.get('/sandbox/drivers', function(req, res) {
	uber.products.setDriversAvailabilityByIDAsync("26546650-e557-4a7b-86e7-6a3942445247", true)
	.then(function(resp) {
		console.log('drivers are available');
	})
})

// GET CURRENT REQUEST BY ID (will change as you update status)
router.get('/current', function(req, res) {
  uber.requests.getByIDAsync(req.query.product_id)
  .then(function(resp) {
    res.send(resp);
  })
  .error(function(err) {
    console.error("could not GET current request by ID", err);
  });
})

// DELETE CURRENT REQUEST BY ID
router.get('/delete', function(req, res) {
  uber.requests.deleteByIDAsync(req.query.product_id)
  .then(function(resp) {
    res.send(resp);
  })
  .error(function(err) {
    console.error("could not DELETE current request by ID", err);
  });
})


/*------------------- News Routes -----------------------*/

//use twilio to send article link to phone via text
router.post('/sendArticle', (req, res) => {
  console.log('SERVER in send article: ', TO_NUMBER, FROM_NUMBER, req.body.link);
  client.messages.create({
    body: req.body.link,
    to: TO_NUMBER,  // Text this number
    from: FROM_NUMBER // From a valid Twilio number
  })
  .then( msg => {
    console.log('SERVER sent msg:', msg);
  })
	.catch( err => {
		console.log ('THIS IS WHERE YOU SEE THE ERR', err);
	})

})

module.exports = router;
