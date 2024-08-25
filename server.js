const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const fs = require('fs')
const say = require('say')
const { recordThing } = require('./js/record.js')
const { chatGPT } = require('./js/openai.js')
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

      var searchData = json["shopping_results"];
      var product1 = "Name: " + searchData[0].title + ", Price: " + searchData[0].price + ", Distributor: " + searchData[0].source + ", Rating: " + searchData[0].store_rating + "\n";
      var product2 = "Name: " + searchData[1].title + ", Price: " + searchData[1].price + ", Distributor: " + searchData[1].source + ", Rating: " + searchData[1].store_rating + "\n";
      var product3 = "Name: " + searchData[2].title + ", Price: " + searchData[2].price + ", Distributor: " + searchData[2].source + ", Rating: " + searchData[2].store_rating + "\n";

      var searchResults = "I am sending 3 search results. Please read off each one in an easy-to-understand manner. " + product1 + product2 + product3;

      chatGPT(searchResults);


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
      say.speak("Welcome to Speak-Commerce! To begin, press the space bar and speak with our virtual assistant to let them know you are there!");
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


//extra thing to have chatGPT tell the user the search results
app.get('/chatShopResults', async(req, res) => {

  print(req.body.text);


});


//renders the home page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//once the server is birthed we need to name it so that we can connect and bond with it like its our child
//this baby is 4000 years old, unless this port number dies on us then we graduate to 5000
app.listen(4000, () => {
  console.log(`Server running at http://localhost:4000`);
});
