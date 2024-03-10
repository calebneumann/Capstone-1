import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'html')));
app.use(express.static(path.join(__dirname, 'css')));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



const openai = new OpenAI(process.env.OPENAI_API_KEY);




app.post('/buttonPress', async (req, res) => {
  console.log(req.body.input);
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: req.body.input}],
      model: "gpt-3.5-turbo",
    });

    const response = completion.choices[0].message.content;

    // Send the response back to the client
    res.send(response);
  } catch (error) {
    // Handle errors
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});
