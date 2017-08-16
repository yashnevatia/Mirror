function imageProcessor(){
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
  // If modifying these scopes, delete your previously saved credentials
  // at ~/.credentials/drive-nodejs-quickstart.json
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
      setTimeout(function(){authorize(JSON.parse(content), listFiles)}, 10000);
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
    function listFiles(auth) {

      //  var drive = google.drive({ version: 'v3', auth: auth });
      var drive = google.drive('v2');
      // var service = google.drive('v3');
      console.log('8.2');
      var fs = require('fs');
      var fileMetadata = {
        name: 'photo.jpg',
        mimeType: 'image/jpg'
      };
      console.log('8.3');
      var media = {
        mimeType: 'image/jpg',
        body: fs.createReadStream('./test.jpg')
      };
      console.log('8.4');
      drive.files.insert({
        resource: fileMetadata,
        media: media,
        auth: auth,
        fields: 'id',
        title: 'title.jpg'
      }, function(err, file) {
        console.log('10');
        if(err) {
          // Handle error
          console.log('9.5')
          console.log(err);
        } else {
          console.log('9');
          console.log('File: ', file);
          drive.files.get({
            'fileId': file.id,
            auth: auth,
          }, function (err, stuff) {
            if(err) {
              // Handle error
              console.log('9.55')
              console.log(err);
            } else {
              console.log('9.55');
              console.log('RESPONSE: ', stuff.selfLink);
            }
          });
        }
      });
    }
  }

module.exports = {
  imageProcessor
}
