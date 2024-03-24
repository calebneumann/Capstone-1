const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const OpenAI = require('openai')
const fs = require('fs')
const say = require('say')
const { recordThing } = require('./js/record.js')

const app = express();

let rec = false;
/*
//console.log('Starting recording...');
async function poop(){
  recordThing();

}
poop();
*/
app.get('/stt', async (req, res) => {
  // Execute your desired action (e.g., call a function)
  console.log("hello?");
  try{

  
  if(rec == false){
    rec = true;
    const poop = await recordThing(rec);
    res.send("Recording...")

  }
  else{
    rec = false;
    const poop = await recordThing(rec);
    res.send(poop);

  }
}
catch (error) {
  console.log(error);
}
});


app.get('/jimboButton', (req, res) => {
  say.speak("what's poppin' jimbo?");

});

app.get('/homepage', async (req, res) => {
  try {
    await say.speak("You are now on the home page.");
  } catch (error) {
    res.status(500).send("Error speaking: " + error.message);
  }
});

app.get('/chatPage', async(req, res) => {
  try {
    await say.speak("You are now on the chat page.");
  } catch (error) {
    res.status(500).send("Error speaking: " + error.message);
  }
});

app.get('/aboutPage', async(req, res) => {
  try {
    await say.speak("You are now on the about page.");
  } catch (error) {
    res.status(500).send("Error speaking: " + error.message);
  }
});

app.get('/ebayPage', async(req, res) => {
  try {
    await say.speak("You are now on the ebay page.");
  } catch (error) {
    res.status(500).send("Error speaking: " + error.message);
  }
});

app.get('/lookupPage', async(req, res) => {
  try {
    await say.speak("You are now on the search page.");
  } catch (error) {
    res.status(500).send("Error speaking: " + error.message);
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'html')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'assets')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var createStream = fs.createWriteStream(__dirname + "/temp/test.txt");
createStream.end();


const openai = new OpenAI(process.env.OPENAI_API_KEY);

var question;
var response;


app.post('/buttonPress', async (req, res) => {
  question = req.body.input;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: req.body.input}],
      model: "gpt-3.5-turbo",
    });

    response = completion.choices[0].message.content;

    // Send the response back to the client
    say.speak(response, 'Samantha', 1.2);

    chatHistory(question, response);
    res.send(response);
  } catch (error) {
    // Handle errors
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

function chatHistory(question, response){

  
  fs.appendFileSync(__dirname + "/temp/test.txt", question);
  fs.appendFileSync(__dirname + "/temp/test.txt", '\n');
  fs.appendFileSync(__dirname + "/temp/test.txt", response);
  fs.appendFileSync(__dirname + "/temp/test.txt", '\n');

}


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(4000, () => {
  console.log(`Server running at http://localhost:4000`);
});
