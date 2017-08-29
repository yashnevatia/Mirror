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
const {sendMessage} = require('./sendMessage');


router.get('/',(req,res) => {
	console.log("thanks");
	res.send(200);
})

/*------------------- Reminder Routes -----------------------*/

router.get('/gettodo', (req, res) => {
    //get all the ToDo's from database and return them when pushed into an array --> set this.setState with it
    Reminder.find()
    .then((resp) =>{
        console.log("mounting",resp);
        res.send(resp)
    })

})

router.post('/addtodo', (req, res) => {
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
  console.log('1 in POST route DELETE todo', req.body.task);

  Reminder.remove({task: req.body.task})
  .then(() =>{
		console.log('2 in POST route DELETE todo')
    return Reminder.find()
  })
	.then((resp) => {
		console.log('3 in POST route DELETE todo')
		console.log("deleted and sending back", resp);
		res.send(resp)
	})
	.catch( err => {
		console.log('ERROR deleting task: ',err);
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

// CONFIG & AUTH FOR UBER (!!!! do this EVERY TIME YOU RELOAD/REFRESH THE PAGE !!!!)
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
    console.error("COULD NOT GET AVAILABLE PRODUCTS");
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
    console.error("COULD NOT GET PRICE ESTIMATES");
  });
})

// POST A RIDE REQUEST
router.post('/request', function(req, res) {
  uber.requests.createAsync({
    "product_id": req.body.product_id,
    "startAddress": req.body.home,
    "endAddress": req.body.destination,
  })
  .then(function(resp) {
    console.log('POSTED UBER REQUEST!!', resp)
    res.send(resp)
  })
  .error(function(err) {
    console.error('COULD NOT PROCESS YOUR REQUEST RN', err);
  });
})

// PUT DRIVER STATUS
// note: defaults to processing, then set to 'accepted', then 'arriving', then 'in_progress'
router.put('/sandbox/status', function(req, res) {
  uber.requests.setStatusByIDAsync(req.body.request_id, req.body.status)
  .then(function(resp) {
    console.log('CHANGED SANDBOX STATUS TO ' + req.body.status);
		if (req.body.status === 'accepted') {
    	res.send('A driver is en route to your location.')
		} else if (req.body.status === 'arriving') {
			res.send('Your ride will be arriving soon.')
    } else if (req.body.status === 'driver_canceled') {
			res.send('Your request has been canceled by the driver.')
		} else {
			throw "that's not a legit command"
		}
  })
	.error(function(err) {
		console.error("Could not change status", err)
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
  uber.requests.getByIDAsync(req.query.request_id)
  .then(function(resp) {
    res.send(resp);
  })
  .error(function(err) {
    console.error("Could not GET current request by ID.");
  });
})

router.get('/current1', function(req, res) {
  uber.requests.getCurrentAsync()
  .then(function(resp) {
    res.send(resp);
  })
  .error(function(err) {
    console.error("Could not GET current request.");
  });
})


// DELETE CURRENT REQUEST BY ID
router.get('/delete', function(req, res) {
  uber.requests.deleteByIDAsync(req.query.product_id)
  .then(function(resp) {
    res.send(resp);
  })
  .error(function(err) {
    console.error("Could not DELETE current request by ID.");
  });
})


/*------------------- News Routes -----------------------*/

//use twilio to send article link to phone via text
router.post('/sendArticle', (req, res) => {
	sendMessage(req.body.link);
})

module.exports = router;
