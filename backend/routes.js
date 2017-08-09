const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { localGetCommand } = require('./processHuman');
const Reminder = require('./models/models').Reminder;

//------------------- ToDo Routes -----------------------

router.get('/todo', (req, res) => {
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
    Reminder.remove({task: req.body.task})
    .then(() =>{
        Remider.find()
        .then((resp) => {
            console.log("deleted", resp);
            res.send(resp)
        })
    })
    //create new Reminder form model and store it in DB
     // return the Reminder in response and push it into array
})

// router.post('/stt', (req, res) => {
//   console.log('in stt post');
//   getCommand('testwidget').then(respObj => {
//     console.log('finished get command');
//     console.log('got this info:', respObj);
//   })
//   .then(() => {
//     res.redirect('/');
//   })
//   .catch( err => {
//     console.log('ERROR on server side :/', err);
//     res.redirect('/');
//   })
// });
//
// // Local Helper Function
// function getCommand (widgetName) {
//   console.log('reached {A}')
//   return localGetCommand(widgetName)
//     .then( respObj => {
//       console.log('reached {B}')
//
//       if (respObj.notFinished) {
//         console.log('reached {C}', respObj)
//         //change text question response
//         this.setState({currentResponse: respObj.response});
//
//         return getCommand(widgetName)
//         // return setTimeout(() => {return getCommand(widgetName)}, 1000);
//       } else {
//         console.log('reached {D}')
//         return respObj;
//       }
//     })
//     .catch( err => {
//       console.log('encountered error :(', err);
//     });
// }

module.exports = router;
