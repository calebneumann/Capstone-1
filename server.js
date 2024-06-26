const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const OpenAI = require('openai')
const fs = require('fs')
const say = require('say')
const { recordThing } = require('./js/record.js')
const { getJson } = require("serpapi");
const app = express();
app.use(bodyParser.json());


app.post('/searchProduct', async (req, res) => {
  try {
    await getJson({
      engine: "google_shopping",
      q: req.body.text,
      api_key: "6f0c25895e35ca946165c00a417842fd45133927050835001054ef47a72a4251"
    }, (json) => {

      //sends only the search results
      res.json(json["shopping_results"]);
    });

  } catch (error) {
    // Handle errors
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

//this is here to have a variable outside this chunk of code so that it can determine when to turn the mic on/off
let rec = false;
app.get('/stt', async (req, res) => {
  // Execute your desired action (e.g., call a function)
  console.log("hello?");
  try{

  //calls the recording function to start recording
  if(rec == false){
    rec = true;
    const poop = await recordThing(rec);
    res.send("Recording...")

  }
  else{
    rec = false;
    const poop = await recordThing(rec);
    const poop2 = await chatGPT(poop);
    res.send(poop2);

  }
}
catch (error) {
  console.log(error);
}
});

//need to get rid of this unless we want the code here as a reference
app.get('/jimboButton', (req, res) => {
  say.speak("what's poppin' jimbo?");

});

//introduces the user to the app on first boot up. the variable makes 
//sure the audio doesn't play every time the home page is accesed
let firstOpen = true;
app.get('/homepage', async (req, res) => {
  if(firstOpen){
    firstOpen = false;
    try {
      say.speak("You are now on the home page. To begin, press the space bar and speak with our virtual assistant to let them know you are there!");
    } catch (error) {
      res.status(500).send("Error speaking: " + error.message);
    }
  }
});

//these are in case we want to say anything when they reach these pages
//but ChatGPT usually takes care of explaining and also these interrupt it talking
app.get('/chatPage', async(req, res) => {
  // try {
  //   await say.speak("You are now on the chat page.");
  // } catch (error) {
  //   res.status(500).send("Error speaking: " + error.message);
  // }
});

app.get('/aboutPage', async(req, res) => {
  // try {
  //   await say.speak("You are now on the about page.");
  // } catch (error) {
  //   res.status(500).send("Error speaking: " + error.message);
  // }
});

app.get('/lookupPage', async(req, res) => {
  // try {
  //   await say.speak("You are now on the search page.");
  // } catch (error) {
  //   res.status(500).send("Error speaking: " + error.message);
  // }
});

//I think this is so that express can easily render the pages
//I think the pages themselves are static and all the cool stuff
//runs in the background here and throws them at the pages
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'html')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'assets')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var createStream = fs.createWriteStream(__dirname + "/temp/test.txt");
createStream.end();


//This is the prompt that is put at the very beginning of the chat history.
//It gives ChatGPT a persona to act as the *OFFICIAL* Speakommerce virtual assistant.
var history = "You are a virtual assistant for our online shopping website called Speak-Commerce. The user will give you a product and you will need to give basic information about said product. Do not offer to redirect them to another website. Only give them a basic summarization of what the product is. Please follow these rules: 1. If the user says they would like to shop for a product AND if the user is NOT on the search page, the first thing you should say is 'I will take you to the search page' before asking what they would like to search for. 2. If they would like to return to the home page, say that you are taking them to the home page. 3. When the user explicitly gives you a product to search for, the first thing you should say is 'Searching for: [PRODUCT]' where PRODUCT is the product they are searching for. "
history = history + "4. If the user would like to learn more about Speakommerce, the only thing you should say is 'I will take you to the about us page'. Now, please introduce yourself to the user, give a warm welcome, and ask if they would like to shop!\n";

fs.appendFileSync(__dirname + "/temp/test.txt", history);

//thingy for openai
const openai = new OpenAI(process.env.OPENAI_API_KEY);

//idk why this is out here but im sure its for a good reason
var response;

async function chatGPT(question){
  history = history + question + '\n';

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: history}],
      model: "gpt-3.5-turbo",
    });

    response = completion.choices[0].message.content;
    history = history + response + '\n';
    console.log(response);
    //Send the response back to the client
    say.speak(response, 'Samantha', 1.2);

    chatHistory(question, response);
    return response;
  } catch (error) {
    // Handle errors
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
}

//stores the chat history in a text file
function chatHistory(question, response){

  
  fs.appendFileSync(__dirname + "/temp/test.txt", question);
  fs.appendFileSync(__dirname + "/temp/test.txt", '\n');
  fs.appendFileSync(__dirname + "/temp/test.txt", response);
  fs.appendFileSync(__dirname + "/temp/test.txt", '\n');

}

//renders the home page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//once the server is birthed we need to name it so that we can connect and bond with it like its our child
//this baby is 4000 years old, unless this port number dies on us then we graduate to 5000
app.listen(4000, () => {
  console.log(`Server running at http://localhost:4000`);
});
