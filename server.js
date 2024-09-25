const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const fs = require('fs')
const say = require('say')
const mysql = require('mysql2')
const { recordThing } = require('./js/record.js')
const { chatGPT } = require('./js/openai.js')
const { getJson } = require("serpapi");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


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



//----------------------------------------LOOK HERE------------------------------------>
//this is to try to streamline database entry. Hopefully no php file?
const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'',
  database: 'speakommerce'
});

database.connect((err) => {
  if(err) throw err;
  console.log('Connected to MySQL...');
})

var userLoggedIn = "";

//registers user into database
app.post('/registerDatabase', (req, res) => {
  const { username, password, phone } = req.body;

  if (!username || !password || !phone) {
    return res.status(400).send('All fields are required!');
  }

  const sql = "insert into registration(username, password, phone) values(?, ?, ?)";
  database.query(sql, [username, password, phone], (err, result) => {
    if (err) {
      if(err.code === 'ER_DUP_ENTRY'){
        return res.status(400).send("Username already used");
      }
      return res.status(500).send("Server error");
    }


    console.log('Data Inserted:', result);
    say.speak("Registration complete");
    res.redirect('login.html');
  });

});

//retrieves user info
app.get('/getUserInfo', (req, res) => {
  const { username, password } = req.query; // Get the username from the query parameters

  // console.log("username is ", username);
  // console.log("password is ", password);

  if (!username || !password) {
    return res.status(400).send('All fields are required!');
  }

  const sql = "SELECT * FROM registration WHERE username = ?";
  database.query(sql, [username], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Server error');
    }

    if (result.length === 0) {
      return res.status(404).send('User not found');
    }

    //TODO: make this acessible somewhere so that we can show this data or change it or something
    console.log("User logged in: ", result[0].username);
    console.log("Password: ", result[0].password);
    console.log("Phone number: ", result[0].phone);

    userLoggedIn = result[0].username;
    res.json(result[0]); // Send the first matching user as a JSON response
  });
});

//--------------------------------AAAAAAAAAAAAHHHHH DATABASE IS UP HERE----------------------------------------->

//checks to see if someone is logged in so that the
//login button is replaced by the profile button
app.get('/logInCheck', async(req, res) => {
  res.send(userLoggedIn);
});

//empties the username var so that everywhere knows to be logged out
app.get('/logOut', async(req, res) => {
  userLoggedIn = "";
  res.send(userLoggedIn);
});

//i guess we can keep this small chunk of code for reference
// app.get('/jimboButton', (req, res) => {
//   const { username, password } = req.query;

//   var successMessage = "yo i got the goods. Here's the proof. The username is " + username + " and the password is " + password;
//   say.speak(successMessage);

//   console.log("Received Username: ", username);
//   console.log("Received Password: ", password);

//   // Send a JSON response back to the client
//   res.json({ message: "Hey man this is server.js. I got the goods." });
// });

app.get('/register', (req, res) => {
  const { username, password, phone } = req.query;

  //confirm to the user that the info was successfully sent to the backend
  var successMessage = "yo i got the goods. Here's the proof. The username is " + username + " and the password is " + password + " and the phone number is " + phone;
  say.speak(successMessage);

  //display given info on the console for testing
  console.log("Received Username: ", username);
  console.log("Received Password: ", password);
  console.log("Received Password: ", phone);

  //use Regular Expressions to see if phone number is in a correct format
  //basically it just needs to see if it has 10 numbers
  //or 11 numbers if there needs to be a 1+ at the beginning
  //like 1+(XXX-XXX-XXXX)


  //if everything is in order, send these babies to the database, redirect to home screen logged in

  //if not, give an error message insulting the user's intelligence

  // Send a JSON response back to the client
  res.json({ message: "Hey man this is server.js. I got the goods." });
});

//introduces the user to the app on first boot up. the variable makes 
//sure the audio doesn't play every time the home page is accesed
let firstOpen = true;
app.get('/homepage', async (req, res) => {
  if(firstOpen){
    firstOpen = false;
    try {
      say.speak("BOO! This voice is boring and scary and we need to change it.");
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

var createStream = fs.createWriteStream(__dirname + "/temp/history.txt");
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
