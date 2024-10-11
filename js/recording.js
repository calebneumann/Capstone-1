//NOTE: This file is seperate from the rest of the project. Its only purpose is to 
//create an mp3 audio file of 'recording voice...'

const OpenAI = require('openai')
const fs = require('fs')
const path = require('path');
const say = require('say');
const { exec } = require('child_process');
const openai = new OpenAI(process.env.OPENAI_API_KEY);


const parentDir = path.join(__dirname, '..');
const speechFile = path.resolve(parentDir + "/public/recordingStart.mp3")

async function tts(){


    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "echo",
      input: "RECORDING VOICE!!!!",
    });
    console.log(speechFile);
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    //await playAudio();
  
  //   fs.unlink(audioFile, (error) => {
  //     if (error) {
  //         console.error(`Error deleting file: ${error.message}`);
  //         return;
  //     }
  //     console.log('MP3 file deleted successfully.');
  // });
  
}

tts();