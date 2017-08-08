const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io  = require('socket.io')(server);
const spawn = require('child_process').spawn;
// Example route
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../build')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

/* the following will change for different computers. */
const myFilePath = '/home/pi/Public/';
const fp1 = myFilePath +'Mirror/rpi-arm-raspbian-8.0-1.2.0/demo2.py';
const fp2 = myFilePath + 'Mirror/rpi-arm-raspbian-8.0-1.2.0';

const py = spawn('python', ['-u', fp1],{
  stdio: ['pipe', 'pipe', 'ignore'],
  cwd: fp2
})

/* the following will change for different computers. */

const readline = require('readline');
const rl = readline.createInterface({
  input: py.stdout,
  output: 'ignore'
});


io.on('connection', function(socket){

	console.log("connected to sockets");
	console.log("listening");
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
    else {
      console.log("widget was heard");
      socket.emit('widget', hotword);
    }

  });

})

server.listen(3000, function() {
    console.log('server running on port 3000!');
});
