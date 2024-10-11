const OpenAI = require('openai')
const fs = require('fs')
const path = require('path');
const say = require('say');
const { exec } = require('child_process');
const openai = new OpenAI(process.env.OPENAI_API_KEY);



//This is the prompt that is put at the very beginning of the chat history.
//It gives ChatGPT a persona to act as the *OFFICIAL* Speakommerce virtual assistant.
var history = "You are a virtual assistant for our online shopping website called Speak-Commerce. You are a guide for the user to help tham navigate the website, as well as searching for products. Please follow these rules: ";

history += "1. If the user says they would like to shop for a product AND if the user is NOT on the search page, the first thing you should say is 'I will take you to the search page' before asking what they would like to search for. ";

history += "2. When you ask if they would like to shop for something and if they say yes, take them to the search page before asking what they want to search for. ";

history += "3. If they would like to return to the home page, say that you are taking them to the home page. ";

history += "4. When the user explicitly gives you a product to search for, the first thing you should say is 'Searching for: [PRODUCT]' where PRODUCT is the product they are searching for. Don't say anything else after that. Wait for a message with information about the product search results. ";

history += "5. If the user would like to learn more about Speakommerce, the only thing you should say is 'I will take you to the about us page'. ";

history += "6. If the user would like to log into their Speak-Commerce account, the only thing you should say is 'I will take you to the login page'. ";

history += "7. If the user would like to register a speak-Commerce account, you should say is 'I will take you to the register page'. Then, you should ask the user to spell out their desired username.";

history += "8. If the user would like to view their Speak-Commerce profile, the only thing you should say is 'I will take you to the profile page'. ";

history += "Now, please introduce yourself to the user, give a warm welcome and ask how you can assist them!\n";

const parentDir = path.join(__dirname, '..');

fs.appendFileSync(parentDir + "/temp/history.txt", history);
const audioFile = parentDir + "/temp/tts.mp3";

var response;

async function chatGPT(question){
    history = history + question + '\n';
  
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: history}],
        model: "gpt-4o-mini",
      });
  
      response = completion.choices[0].message.content;
      history = history + response + '\n';
      console.log(response);
      //Send the response back to the client
      tts(response);
  
      chatHistory(question, response);
      return response;
    } catch (error) {
      // Handle errors
      console.error('Error:', error);
    }
  }
  
//stores the chat history in a text file
function chatHistory(question, response){

  
  fs.appendFileSync(parentDir + "/temp/history.txt", question);
  fs.appendFileSync(parentDir + "/temp/history.txt", '\n');
  fs.appendFileSync(parentDir + "/temp/history.txt", response);
  fs.appendFileSync(parentDir + "/temp/history.txt", '\n');

}

const speechFile = path.resolve(parentDir + "/public/tts.mp3")


async function tts(speech) {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "echo",
    input: speech,
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


 

function playAudio(){
// Command to open the default audio player
const command = process.platform === 'win32' 
    ? `start "" "${audioFile}"`  // For Windows
    : process.platform === 'darwin' 
    ? `open "${audioFile}"`       // For macOS
    : `xdg-open "${audioFile}"`;  // For Linux

// Execute the command
exec(command, (error) => {
    if (error) {
        console.error(`Error playing audio: ${error.message}`);
        return;
    }
    console.log('Playing audio...');
});
}



module.exports = { 
  chatGPT,
  tts
};