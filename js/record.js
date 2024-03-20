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

function startRecord(){



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
  voiceToText(filePath);
}
}




//Function to transcribe audio

async function voiceToText(filePath) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
    language: "en"
  });

  console.log(transcription.text);
  fs.unlinkSync(filePath);

}


// Initialize keypress
keypress(process.stdin);

function recordThing(rec){
recording == rec;


    if(recording == true){ //stop recording
        recording = false;

        startRecord();
        say.speak("Recording has stopped", 'Samantha', 1.2);
    }
    else if (recording == false) { //start's recording
      recording = true;
      file = fs.createWriteStream(filePath, { encoding: 'binary' });

      startRecord();
      say.speak("Recording voice", 'Samantha', 1.2);
    }

process.stdin.resume();
}
//recordThing();
module.exports = { recordThing };