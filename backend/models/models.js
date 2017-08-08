const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

const reminderSchema = mongoose.Schema({
  task: {
    type: String,
    required: true
  }
  //documents is array of objects with (docId, docName, isShared (whether it is a shared doc or not))
});

var Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = {
  Reminder: Reminder,
};
