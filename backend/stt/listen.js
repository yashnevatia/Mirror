/* File that controls interaction with Google Speech STT */

// Exported Function
// streamingMicRecognize()
//  - Param: none (can in future have to specify language, etc.)
//  - Return: string (what the user said)
//  - Description: Google speech starts listening to mic audio, stops listening
//                 when there is a silence, and translates audio to text

function streamingMicRecognize (/*encoding, sampleRateHertz, languageCode*/) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');

    // [START speech_streaming_mic_recognize]
    const record = require('node-record-lpcm16');

    // Imports the Google Cloud client library
    const Speech = require('@google-cloud/speech');

    // Instantiates a client
    const speech = Speech();

    // The encoding of the audio file, e.g. 'LINEAR16'
    const encoding = 'LINEAR16';

    // The sample rate of the audio file in hertz, e.g. 16000
    const sampleRateHertz = 16000;

    // The BCP-47 language code to use, e.g. 'en-US'
    const languageCode = 'en-US';

    const request = {
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode
      },
      interimResults: false // If you want interim results, set this to true
    };

    // Create a recognize stream
    const recognizeStream = speech.streamingRecognize(request)
      .on('error', console.error)
      .on('data', (data) => {
          // return of 0 represents that reached transcription time limit
          // if reach this point, need to press 'Ctrl+C'
        const returnScript = (data.results[0] && data.results[0].alternatives[0])
            ? data.results[0].alternatives[0].transcript
            : 0;
        console.log(returnScript);

        //STOP AT A SILENCE
        if (data.results[0].isFinal) {
          record.stop();
          console.log('stopped listening');
        }

        if (returnScript) {
          // return;
          resolve(returnScript);
        }
        reject('error - no return script');
      });

    // Start recording and send the microphone input to the Speech API
    console.log('start listening');
    record
      .start({
        sampleRateHertz: sampleRateHertz,
        threshold: 0,
        thresholdEnd: 0.01,
        verbose: false,
        recordProgram: 'rec', // Try also "arecord" or "sox"
        silence: '0.5'
      })
      .on('error', console.error)
      .pipe(recognizeStream);

    console.log('Listening, press Ctrl+C to stop.');
  }); // end promise
}



/* TO BE PUT IN:
//AMANDA CHANGE - STOP AT A SILENCE
      process.stdout.write(
        (data.results[0] && data.results[0].alternatives[0])
          ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
          : `\n\nReached transcription time limit, press Ctrl+C\n`)

      console.log('DATA:', data.results);
      if (data.results[0].isFinal) {
        console.log('stopped');
        record.stop();
        stopSpeaking = true;
        return;
      }

  });

// Start recording and send the microphone input to the Speech API
if (!stopSpeaking) {
  console.log('reaches here');
  record
  .start({
    sampleRateHertz: sampleRateHertz,
    threshold: 0,
    //AMANDA CHANGE
    thresholdEnd: 0.01,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: false,
    recordProgram: 'rec', // Try also "arecord" or "sox"
    silence: '0.5'
  })
  .on('error', console.error)
  .pipe(recognizeStream);
}


  // //AMANDA CHANGE - STOP RECORDING AFTER 3 SECONDS
  // setTimeout(function () {
  //   record.stop()
  // }, 5000)

console.log('Listening, press Ctrl+C to stop.');
*/

module.exports = { streamingMicRecognize };
