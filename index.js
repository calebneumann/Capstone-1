/*
import OpenAI from "openai";

const openai = new OpenAI();

async function chatGPT() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "What is two plus two, but talk like mario!" }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0].message.content);
  const response = String(completion.choices[0].message.content);

  document.getElementById("textField").textContent = response;
  text.style.display = "block";

}
*/

function displayText(){

  document.getElementById("textField").textContent = "HEEEELP IM STUCK IN JAVASCRIPT";
  text.style.display = "block";

}
