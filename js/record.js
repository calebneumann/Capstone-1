const keypress = require('keypress')
const say = require('say')



async function playAudioAndExit() {
    return new Promise((resolve, reject) => {
    say.speak("Recording has stopped", null, 1.2, (err) => {
        if (err) {
          console.error('Error playing audio:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
}


// Initialize keypress
keypress(process.stdin);

// Set raw mode to get keystrokes
function record(){

process.stdin.setRawMode(true);
let recording = false;
// Event listener for key presses
process.stdin.on('keypress', async (ch, key) => {
  if (key) {
    if (key.ctrl && key.name === 'c') {
      console.log('Exiting...');
      process.exit(); // Exit the process gracefully
    } 
    else if(recording == true){
        recording = false;
        console.log("Recording Stopped");
        await playAudioAndExit();
    }
    else if (key.name === 'shift(left)' && recording == false) {
      recording = true;
      console.log('Recording (not actually recording)');
      say.speak("Recording voice", 'Samantha', 1.2);
      // Your code to run when space bar is held down
    }

  }
});

// Listen for keypresses
process.stdin.resume();
}

module.exports = { record };