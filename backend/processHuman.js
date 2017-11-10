/* File that integrates the three parts of the speech -> widgetText process */

const { streamingMicRecognize } = require('./stt/listen');
const { sendQuery } = require('./nlp/getResponse');
const { analyzeRequest } = require('./nlp/responseLogic');

// Exported Mic Speech -> Readable Object Function
function localGetCommand(widgetName) {
  console.log('reached 1');
  return streamingMicRecognize()
    .then( userRequest => {
      console.log('reached 2');
      return sendQuery(userRequest, widgetName);
    })
    .then( response => {
      console.log('reached 3:');
      return analyzeRequest(response.data);
    })
    .catch( err => {
      console.log('ERROR in processing human: ', err);
      return { notFinished: false,
        category: '',
        params: {},
        response: 'ERROR from process human' }
    });
}

module.exports = { localGetCommand };
