const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');


// Replace this with the path to your MP3 file
const parentDir = path.join(__dirname, '..');

const audioFile = parentDir + "/temp/tts.mp3";
 


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

