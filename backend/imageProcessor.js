function imageProcessor() {
  var {sendMessage} = require('./sendMessage');
  var sys = require('sys');
  var exec = require('child_process').exec;
  function bashCallback(error, stdout, stderr){
    sys.puts(stdout);
  }
  exec("raspistill -o test.jpg", bashCallback);

  var fs = require('fs');
  var readline = require('readline');
  var google = require('googleapis');
  var googleAuth = require('google-auth-library');
  var axios = require('axios');
  var ImageModel = require('./models/models').ImageModel;
  var axios = require('axios');
  // If modifying these scopes, delete your previously saved credentials
  // at ~/.credentials/drive-nodejs-quickstart.json
  const MY_PICTURE_FOLDER = '0B7knwYcCq901X2l1NXZZblB0blU';

  var SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive/file'];
  var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
    var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';
    // Load client secrets from a local file.
    fs.readFile('/home/pi/Public/Mirror/backend/client_secret.json', function processClientSecrets(err, content) {
      console.log('1');
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      // Authorize a client with the loaded credentials, then call the
      // Drive API.
      setTimeout(function(){authorize(JSON.parse(content), insertPicture)}, 10000);
    });
    /**
    * Create an OAuth2 client with the given credentials, and then execute the
    * given callback function.
    *
    * @param {Object} credentials The authorization client credentials.
    * @param {function} callback The callback to call with the authorized client.
    */
    function authorize(credentials, callback) {
      console.log('2');
      var clientSecret = credentials.installed.client_secret;
      var clientId = credentials.installed.client_id;
      var redirectUrl = credentials.installed.redirect_uris[0];
      var auth = new googleAuth();
      var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
          getNewToken(oauth2Client, callback);
        } else {
          console.log('3');
          oauth2Client.credentials = JSON.parse(token);
          callback(oauth2Client);
        }
      });
    }
    /**
    * Get and store new token after prompting for user authorization, and then
    * execute the given callback with the authorized OAuth2 client.
    *
    * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
    * @param {getEventsCallback} callback The callback to call with the authorized
    *     client.
    */
    function getNewToken(oauth2Client, callback) {
      console.log('4');
      var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      });
      console.log('Authorize this app by visiting this url: ', authUrl);
      var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
          console.log('5');
          if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
          }
          oauth2Client.credentials = token;
          storeToken(token);
          callback(oauth2Client);
        });
      });
    }
    /**
    * Store token to disk be used in later program executions.
    *
    * @param {Object} token The token to store to disk.
    */
    function storeToken(token) {
      try {
        console.log('6');
        fs.mkdirSync(TOKEN_DIR);
      } catch (err) {
        if (err.code != 'EEXIST') {
          throw err;
        }
      }
      console.log('7');
      fs.writeFile(TOKEN_PATH, JSON.stringify(token));
      console.log('Token stored to ' + TOKEN_PATH);
    }
    /**
    * Lists the names and IDs of up to 10 files.
    *
    * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
    */
    function insertPicture(auth) {

      var drive = google.drive('v2');
      var fs = require('fs');

      const now = new Date();
      const thisPicName = now.getYear()'/'+(now.getMonth()+1)+'/'+now.getDate()+'.png';

      var fileMetadata = {
        name: 'photo.jpg',
        mimeType: 'image/jpg',
        title: thisPicName,
        parents: MY_PICTURE_FOLDER ? [{id: MY_PICTURE_FOLDER}] : []
      };

      var media = {
        mimeType: 'image/jpg',
        body: fs.createReadStream('./test.jpg')
      };

      drive.files.insert({
        resource: fileMetadata,
        media: media,
        auth: auth,
        fields: 'id',
        title: 'title.jpg'
      }, function(err, file) {
        if(err) console.log(err);
        else {
          drive.files.get({
             fileId: file.id,
             auth: auth,
          }, function (err, stuff) {
            if(err)console.log(err);
            else {
              // console.log('RESPONSE: ', stuff);
              sendMessage(stuff.embedLink);
              var image = new ImageModel({
                link : stuff.embedLink
              });
              axios.get('http://api.openweathermap.org/data/2.5/weather?q=SanFrancisco&APPID=89fdd5afd3758c1feb06e06a64c55260')
              .then( resp => {
                image.description = resp.data.weather[0].description;
                image.min =  resp.data.main.temp_min-273.15;
                image.max =  resp.data.main.temp_max-273.15;

                image.save();
              })
              .catch( err => {
                console.log (':( error', err);
              })
            }
          });
        }
      });
    }
  }

module.exports = {
  imageProcessor
}
