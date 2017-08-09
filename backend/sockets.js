// FILE WITH CODE FOR SOCKETS

const spawn = require('child_process').spawn;
const { localGetCommand } = require('./processHuman');

/* ***** HOTWORD -- LOCAL CODE ***** */
// the following will change for different computers.
// const myFilePath = '/home/pi/Public/';
const myFilePath = '/Users/JFH/horizons/';
const fp1 = myFilePath +'Mirror/rpi-arm-raspbian-8.0-1.2.0/demo2.py';
const fp2 = myFilePath + 'Mirror/rpi-arm-raspbian-8.0-1.2.0';

const py = spawn('python', ['-u', fp1],{
  stdio: ['pipe', 'pipe', 'ignore'],
  cwd: fp2
})
// the above will change for different computers.

const readline = require('readline');
const rl = readline.createInterface({
  input: py.stdout,
  output: 'ignore'
});

/* ***** STT -- LOCAL CODE ***** */
function getCommand (widgetName, socket, io) {
  console.log('reached {A}')
  return localGetCommand(widgetName)
    .then( respObj => {
      console.log('reached {B}', respObj)

      if (respObj.notFinished) {
        console.log('reached {C}')
        // cycle incomplete, send new prompt to container
        io.to('W_CONTAINER').emit('stt_continuing', respObj );

        return getCommand(widgetName, socket, io)
        // return setTimeout(() => {return getCommand(widgetName)}, 1000);
      } else {
        console.log('reached {D}');
        // completed cycle, send to container & widget
        io.emit('stt_finished', respObj);
        return respObj;
      }
    })
    .catch( err => {
      console.log('encountered error :(', err);
    });
}

/* ***** SOCKETS LISTENERS ***** */
module.exports = function (io) {
  io.on('connection', function(socket){

  	console.log("connected to sockets");
  	console.log("listening");

    // socket listener for Hot Word
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
      else if(hotword === 'radio'){
        console.log("widget was heard");
        socket.emit('radio');
      }
      else if(hotword === 'news'){
        console.log("widget was heard");
        socket.emit('news');
      }
      else {
        console.log("unknown hotword");
      }
    });

    // socket listeners for STT
    socket.room = 'DEFAULT';
    socket.on('join', widgetName => {
      console.log('SERVER in join', widgetName);
      socket.room = widgetName;

      socket.join(socket.room, () => {
        console.log('SERVER joined ', socket.room);
      });
    });

    socket.on('stt', widgetName => {
      console.log('SERVER in stt', widgetName);
      getCommand(socket.room, socket, io);
    });

    socket.on('invalid_request', () => {
      console.log('SERVER in invalid request');
      io.to('W_CONTAINER').emit('invalid_request');
    })

  });
}
