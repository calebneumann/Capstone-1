const OpenAI = require('openai')
const fs = require('fs')
const path = require('path');
const say = require('say')
const openai = new OpenAI(process.env.OPENAI_API_KEY);


//This is the prompt that is put at the very beginning of the chat history.
//It gives ChatGPT a persona to act as the *OFFICIAL* Speakommerce virtual assistant.
var history = "You are a virtual assistant for our online shopping website called Speak-Commerce. The user will give you the name of a product. Do not offer to redirect them to another website. Please follow these rules: 1. If the user says they would like to shop for a product AND if the user is NOT on the search page, the first thing you should say is 'I will take you to the search page' before asking what they would like to search for. 3. When you ask if they would like to shop for something and if they say yes, take them to the search page before asking what they want to search for. 3. If they would like to return to the home page, say that you are taking them to the home page. 4. When the user explicitly gives you a product to search for, the first thing you should say is 'Searching for: [PRODUCT]' where PRODUCT is the product they are searching for. Don't say anything else after that. Wait for a message with information about the product search results. 5. If the user would like to learn more about Speakommerce, the only thing you should say is 'I will take you to the about us page'. Now, please introduce yourself to the user, give a warm welcome, and ask if they would like to shop!\n";

const parentDir = path.join(__dirname, '..');

fs.appendFileSync(parentDir + "/temp/test.txt", history);
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
    }
  }
  
  //stores the chat history in a text file
  function chatHistory(question, response){
  
    
    fs.appendFileSync(parentDir + "/temp/test.txt", question);
    fs.appendFileSync(parentDir + "/temp/test.txt", '\n');
    fs.appendFileSync(parentDir + "/temp/test.txt", response);
    fs.appendFileSync(parentDir + "/temp/test.txt", '\n');
  
  }
  module.exports = { chatGPT }