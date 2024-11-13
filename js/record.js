const keypress = require('keypress')
const say = require('say')
const { OpenAI } = require('openai');
const record = require('node-record-lpcm16');
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const wav = require('wav');
const fs = require('fs');
let recording = false;


const filePath = 'voice-to-text.wav';
let file = "";
let sttResponse = "";


function speakAndWait(text) {
  return new Promise((resolve, reject) => {
      say.speak(text, null, null, (err) => {
          if (err) {
              reject(err); // Handle any error that occurs during speech
          } else {
              resolve();  // Resolve the promise when speech is finished
          }
      });
  });
}


async function startRecord(){
  console.log("SPEAK NOW");
  const writer = new wav.Writer({
    channels: 1,
    sampleRate: 16000,
    bitDepth: 16,
  });
  const mic = record.record({
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16,
  });

  if(recording == true){

  console.log('Recording...');
  mic._stream.pipe(writer).pipe(file); //Use mic._stream.pipe for piping
  }

  else{
    mic._stream.pipe(writer).end(); //Use mic._stream.end() for to end recording
    console.log('Recording stopped.');
    file.end();
    say.stop();
    speakAndWait("Recording has stopped");

    await voiceToText(filePath);
  }
}

//Function to transcribe audio

async function voiceToText(filePath) {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      language: "en"
    });
    sttResponse = transcription.text;
    console.log(transcription.text);
  } catch (error) {
    // Handle the error if the audio file is too short or any other error occurs
    if (error.message.includes("audio file is too short")) {
      console.error("Error: The audio file is too short for transcription.");
      sttResponse = "Error: The audio file is too short for transcription.";
    } else {
      console.error("An error occurred during transcription:", error.message);
      sttResponse = "Error: An error occurred during transcription.";

    }
  } finally {
    // Clean up the file regardless of success or failure
    fs.unlinkSync(filePath);
  }
}


// Initialize keypress
keypress(process.stdin);

async function recordThing(rec){
  recording == rec;


  if(recording == true){ //stop recording
      recording = false;

      await startRecord();

  }
  else if (recording == false) { //start's recording
    recording = true;
    file = fs.createWriteStream(filePath, { encoding: 'binary' });
    say.stop();
    await speakAndWait("Recording voice");
    await startRecord();
  }
  return sttResponse;
}
//recordThing();
module.exports = { recordThing };