const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { localGetCommand } = require('./processHuman');


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
