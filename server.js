const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const OpenAI = require('openai')
const fs = require('fs')
const say = require('say')
const { record } = require('./js/record.js')

const app = express();



console.log('Starting recording...');
async function poop(){
  record();

}

poop();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'html')));
app.use(express.static(path.join(__dirname, 'css')));
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

app.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});
