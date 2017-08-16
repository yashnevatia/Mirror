const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

const reminderSchema = mongoose.Schema({
  task: {
    type: String,
    required: true
  }
  //documents is array of objects with (docId, docName, isShared (whether it is a shared doc or not))
});

const ImageModel = mongoose.Schema({
  link: String,
  description: String,
  min: Number,
  max: Number
})

var Reminder = mongoose.model('Reminder', reminderSchema);
var ImageModel = mongoose.model('ImageModel', ImageModel);

module.exports = {
  Reminder: Reminder,
  ImageModel: ImageModel
};
