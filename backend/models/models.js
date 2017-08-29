const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

const reminderSchema = mongoose.Schema({
  task: {
    type: String,
    required: true
  }
});

const imageModelSchema = mongoose.Schema({
  link: String,
  description: String,
  min: Number,
  max: Number
})

var Reminder = mongoose.model('Reminder', reminderSchema);
var ImageModel = mongoose.model('ImageModel', imageModelSchema);

module.exports = {
  Reminder: Reminder,
  ImageModel: ImageModel
};
