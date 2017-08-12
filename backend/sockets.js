// FILE WITH CODE FOR SOCKETS

const spawn = require('child_process').spawn;
const { localGetCommand } = require('./processHuman');
const readline = require('readline');
const SpotifyWebApi = require('spotify-web-api-node');
var refresh = require('spotify-refresh');
/* ***** HOTWORD -- LOCAL CODE ***** */
// the following will change for different computers.
const myFilePath = '/home/pi/Public/'; // PI
// const myFilePath = '/Users/JFH/horizons/'; // JENS
// const myFilePath = '/Users/amandahansen/' // AMANDA

const fp1 = myFilePath +'Mirror/rpi-arm-raspbian-8.0-1.2.0/demo2.py';
const fp2 = myFilePath + 'Mirror/rpi-arm-raspbian-8.0-1.2.0';

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
        return getCommand(widgetName, socket, io);
      }
      else {
        console.log('reached {D}');
        io.emit('stt_finished', respObj);
        listenHotword(socket);

        return respObj;
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

    // socket listeners for STT
    socket.room = 'DEFAULT';
    console.log('DEFAULT ROOM SET:', socket.room);

    socket.on('join', widgetName => {
      console.log('SERVER in join', widgetName);
      socket.room = widgetName;
      socket.join(socket.room, () => {
        console.log('WIDGET joined ', socket.room);
      });
    });

    socket.on('stt', widgetName => {
      if(py)py.kill();
      console.log('SERVER in stt', widgetName);
      // we are killing children
	  py.kill();
      getCommand(socket.room, socket, io);
    });

    socket.on('invalid_request', () => {
      console.log('SERVER in invalid request');
      io.to('W_CONTAINER').emit('invalid_request');
    });

    socket.on('custom_msg', (msg) => {
      console.log('SERVER in custom message');
      io.to('W_CONTAINER').emit('custom_msg', msg);
    })

    socket.on('getToken', refreshToken => {
      console.log("reached backend for token");

      /*let spotifyApi = new SpotifyWebApi({
        clientId: "681448e7f283472184ea59961a28e830",
        clientSecret: "40afeab55a564fe297d1c9a8bbdcfd55",
        redirectUri: "http://localhost:3000"
      });

      spotifyApi.setRefreshToken(refreshToken);

      spotifyApi.refreshAccessToken()
      .then(data => {
        console.log("have refreshed sending now");
        spotifyApi.setAccessToken(data.body['access_token']);
        socket.emit('setNewAccessToken', spotifyApi.getAccessToken());
      })
      .catch(error => {
        console.log("error", error);
      })*/



	refresh(refreshToken, "681448e7f283472184ea59961a28e830", "40afeab55a564fe297d1c9a8bbdcfd55", function (err, res, body) {
			if (err) return
		//body = JSON.parse(body)
		console.log("reached here", body);
		//console.log(JSON.stringify(body)  );
	})

    })

  });
}
