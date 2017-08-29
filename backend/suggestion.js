function suggestion(){
  var ImageModel = require('./models/models').ImageModel;
  var {sendMessage} = require('./sendMessage')
  var axios = require('axios');
  axios.get('http://api.openweathermap.org/data/2.5/weather?q=SanFrancisco&APPID=89fdd5afd3758c1feb06e06a64c55260')
  .then(resp => {
    ImageModel.find({description: resp.data.weather[0].description})
    .then(images => {
      if(!images)sendMessage("Sorry no available suggestions");
      else{
        sendMessage(images[0].link);
      }
    })
    .catch(err => {
      console.log(err);
    })
  })
  .catch(err => {
    console.log(err);
  })
}
module.exports = {
  suggestion
}
