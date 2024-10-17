/*<-----------------------------HEEEEYYYYY LOOOOOOOOK HEEEEEEEEEERRRRRRRRRREEEEEEEEEEEEE-------------->
1. MAKE SURE YOU DO GIT PULL TO MAKE SURE YOU ARE UP TO DATE WITH THE PROJECT
2. MAKE SURE YOU OPEN XAMPP AND CREATE THE CONNECTION TO APACHE AND MYSQL TO START THE DATABASE
3. THIRD THING HEEEEEERRRRRRRREEEEEEEEEEEEE
*/
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const fs = require('fs')
const say = require('say')
const mysql = require('mysql2')
const { recordThing } = require('./js/record.js')
const { chatGPT } = require('./js/openai.js')
const { sendNotif } = require('./js/send_message.js')
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
var currPage = "home";
app.get('/stt', async (req, res) => {
  // Execute your desired action (e.g., call a function)
  say.stop();
  currPage = req.headers['source-page']
  console.log("The user is on the " + currPage + " page");
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

app.get('/insertInfo', async (req, res) => {
  say.stop();
  currPage = req.headers['source-page']
  console.log("The user is on the " + currPage + " page");
  // Execute your desired action (e.g., call a function)
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
//creates a connection with database details
const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'',
  database: 'speakommerce'
});

//establishes the connection with the database
database.connect((err) => {
  if(err) throw err;
  console.log('Connected to MySQL...');
})

var userLoggedIn = "";
var userPassword = "";
var userPhone = "";


//registers user into database
app.post('/registerDatabase', (req, res) => {
  const { username, password, phone } = req.body;

  //checks of any fields are empty
  if (!username || !password || !phone) {
    return res.status(400).send('All fields are required!');
  }

  //check to see if phone number is in the correct format
  const phonePattern = /^\d{10}$/;
  let result = phonePattern.test(phone)
  if(!result){
    chatGPT("ERROR: The phone number was entered incorrectly.");

    return res.status(400).send('Phone # in incorrect format!');
  }

  //this registers user info into the database
  const sql = "insert into registration(username, password, phone) values(?, ?, ?)";
  database.query(sql, [username, password, phone], (err, result) => {
    if (err) {
      if(err.code === 'ER_DUP_ENTRY'){
        chatGPT("ERROR: The username is already used.");

        return res.status(400).send("Username already used");
      }
      chatGPT("ERROR: Server Error.");

      return res.status(500).send("Server error");
    }

    //NOTE: The virtual phone number expires every
    //two weeks so if this stops working thats why
    var messageNumber = "+1" + phone;
    sendNotif(messageNumber, "Your Speakommerce account has been activated");


    //audibly confirms to the user they have been registered
    //and they are redirected to the login page
    console.log('Data Inserted:', result);
    //say.speak("Registration complete. A notification has been sent to your registered phone number!");
    chatGPT("The user is successfully registered");

    res.redirect('login.html');
  });

});

//this is used to log in the user
app.get('/getUserInfo', (req, res) => {
  const { username, password } = req.query; // Get the username from the query parameters

  // console.log("username is ", username);
  // console.log("password is ", password);

  //makes sure all fields are filled
  if (!username || !password) {
    return res.status(400).send('All fields are required!');
  }

  //this uses the username to retrieve the password from the database
  const sql = "SELECT * FROM registration WHERE username = ?";
  database.query(sql, [username], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Server error');
    }

    //checks if returned username exists or if password is incorrect
    if (result.length === 0 || password != result[0].password) {

      chatGPT("ERROR: Incorrect username and/or password");

      return res.status(404).send('Username and/or password incorrect');
    }

    //TODO: make this acessible somewhere so that we can show this data or change it or something
    console.log("User logged in: ", result[0].username);
    console.log("Password: ", result[0].password);
    console.log("Phone number: ", result[0].phone);

    userLoggedIn = username;
    userPassword = password;
    userPhone = result[0].phone;
    chatGPT("The user is successfully logged in");
    res.json(result[0]); // Send the first matching user as a JSON response
  });
});


//this is used change your password
app.post('/changePassword', (req, res) => {
  const { oldPassword, newPassword } = req.body; // Get the username from the query parameters
  console.log("hellp")
  
  console.log("old is ", oldPassword);
  console.log("new is ", newPassword);

  //makes sure all fields are filled
  if (!oldPassword || !newPassword) {
    return res.status(400).send('All fields are required!');
  }

  if (oldPassword != userPassword) {
    return res.status(404).send('Password is incorrect');
  }

    //change the password using userLoggedIn var
  const sqlWrite = "UPDATE registration SET password = ? WHERE username = ?";
  database.query(sqlWrite, [newPassword, userLoggedIn], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Server error');
    }

    if(newPassword == userPassword){
      return res.status(400).send('New password can not be the same as old password!');

    }

    userPassword = newPassword;
    return res.status(200).send('Password successfully changed!');
  });

});


//this is used to change your phone number
app.post('/changePhone', (req, res) => {
  const { oldPhone, newPhone } = req.body; // Get the username from the query parameters
  console.log("hellp")
  
  console.log("old is ", oldPhone);
  console.log("new is ", newPhone);

  //makes sure all fields are filled
  if (!oldPhone || !newPhone) {
    return res.status(400).send('All fields are required!');
  }

  const phonePattern = /^\d{10}$/;
  let result = phonePattern.test(newPhone)
  if(!result){
    return res.status(400).send('Phone # in incorrect format!');
  }


  if (oldPhone != userPhone) {
    return res.status(404).send('Phone # is incorrect');
  }

    //change the password using userLoggedIn var
  const sqlWrite = "UPDATE registration SET phone = ? WHERE username = ?";
  database.query(sqlWrite, [newPhone, userLoggedIn], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Server error');
    }

    if(newPhone == userPhone){
      return res.status(400).send('New phone # can not be the same as old phone #');

    }

    userPhone = newPhone;
    return res.status(200).send('Phone # successfully changed!');
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
  console.log("User has logged out...");
  res.send(userLoggedIn);
});


//i guess we can keep this small chunk of code for reference
/*
app.get('/jimboButton', (req, res) => {
  const { username, password } = req.query;

  var successMessage = "yo i got the goods. Here's the proof. The username is " + username + " and the password is " + password;
  say.speak(successMessage);

  console.log("Received Username: ", username);
  console.log("Received Password: ", password);

  // Send a JSON response back to the client
  res.json({ message: "Hey man this is server.js. I got the goods." });
});
*/


//introduces the user to the app on first boot up. the variable makes 
//sure the audio doesn't play every time the home page is accesed
let firstOpen = true;
app.get('/homepage', async (req, res) => {
  if(firstOpen){
    firstOpen = false;
    try {
      //say.speak("BOO! This voice is boring and scary and we need to change it.");
      chatGPT("Hello!");
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
