const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
// stt & uber routes
const routes = require('./routes');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Example route
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../build')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './public/index.html'));
});


// START SOCKET SERVER STUFF
const server            = require('http').Server(app);
const io                = require('socket.io')(server);
const socketConfig = require ('./sockets.js');
socketConfig(io);
// END SOCKET SERVER STUFF


// WIDGET Routes
app.use('/', routes);


server.listen(3000, function() {
    console.log('server running on port 3000!');
});
