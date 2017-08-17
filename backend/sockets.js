// FILE WITH CODE FOR SOCKETS

const spawn = require('child_process').spawn;
const { localGetCommand } = require('./processHuman');
const readline = require('readline');
const SpotifyWebApi = require('spotify-web-api-node');
var refresh = require('spotify-refresh');
var {imageProcessor} = require('./imageProcessor');
var {suggestion} = require('./suggestion');
/* ***** HOTWORD -- LOCAL CODE ***** */
// the following will change for different computers.
const myFilePath = '/home/pi/Public/'; // PI
// const myFilePath = '/Users/JFH/horizons/'; // JENS
//const myFilePath = '/Users/amandahansen/' // AMANDA

const fp1 = myFilePath +'Mirror/rpi-arm-raspbian-8.0-1.2.0/demo2.py';
const fp2 = myFilePath + 'Mirror/rpi-arm-raspbian-8.0-1.2.0';

/* ***** STT -- LOCAL CODE ***** */
function getCommand (widgetName, socket, io) {
  console.log('reached {A}', widgetName)
  return localGetCommand(widgetName)
    .then( respObj => {
      console.log('reached {B}', respObj, respObj.category.toUpperCase(), widgetName)
      if(respObj.category.toUpperCase().indexOf(widgetName) === -1){
        io.to('W_CONTAINER').emit('invalid_request');
        listenHotword(socket);
        return;
      }
      else if (respObj.notFinished) {
        console.log('reached {C}')
        // cycle incomplete, send new prompt to container
        if (widgetName === 'UBER') {
          console.log('!!!!!! emitting continuing to uber !!!!!!')
          io.to('UBER').emit('stt_continuing', respObj);
        }
        io.to('W_CONTAINER').emit('stt_continuing', respObj );
        return getCommand(widgetName, socket, io);
      }
      else {
        console.log('reached {D}', widgetName);
        io.to(widgetName).emit('stt_finished', respObj);
        io.to('W_CONTAINER').emit('stt_finished', respObj);
        listenHotword(socket);
        //return respObj;
      }
    })
    .catch( err => {
      console.log('encountered error :(', err);
    });
}

/**** child process function ***/

let py;
let rl;

function listenHotword(socket) {

  console.log("python file is listening again");

  py = spawn('python', ['-u', fp1],{
    stdio: ['pipe', 'pipe', 'ignore'],
    cwd: fp2
  });

  rl = readline.createInterface({
    input: py.stdout,
    output: 'ignore'
  });

  rl.on('line', hotword => {
    console.log("hotword detected", hotword);
    if(hotword === 'wakeup'){
      console.log("wakeup");
      socket.emit('wakeup');
    }
    else if(hotword === 'sleep'){
      console.log("sleep");
      socket.emit('sleep');
    }
    else if(hotword === 'cancel'){
      console.log("cancel");
      socket.emit('cancel');
    }
    else if(hotword === 'iris'){
      console.log("iris");
    }
    else if(hotword === 'picture'){
      console.log('picture');
      imageProcessor();
      py.kill();
      listenHotword(socket);
    }
    else if(hotword === 'outfits'){
      console.log("outfits");
      suggestion();
      py.kill();
      listenHotword(socket);
    }
    else {
      socket.emit('widget', hotword);
    }
  });
}

/* ***** SOCKETS LISTENERS ***** */
module.exports = function (io) {

  io.on('connection', function(socket){

  	console.log("SOCKETS CODE compiled");

    listenHotword(socket);

    socket.on('join', widgetName => {
      console.log('SERVER in join', widgetName);
      if(widgetName === 'W_CONTAINER'){
        socket.join('W_CONTAINER', () => {
          console.log('WIDGET joined ', 'W_CONTAINER');
        });
      }
      else{
        console.log('leave room', socket.room, 'join', widgetName)
        if(socket.room) socket.leave(socket.room);
        socket.room = widgetName;
        socket.join(socket.room, ()=>{
          console.log('WIDGET joined ', socket.room);
        })
      }
    });

    socket.on('stt', widgetName => {
      if(py)py.kill();
      console.log('SERVER in stt', widgetName);
      getCommand(widgetName, socket, io);
    });

    socket.on('invalid_request', () => {
      console.log('SERVER in invalid request');
      io.to('W_CONTAINER').emit('invalid_request');
    });

    socket.on('custom_msg', (msg) => {
      console.log('SERVER in custom message');
      io.to('W_CONTAINER').emit('custom_msg', msg);
    })
  });

}
