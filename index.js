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


async function displayText(){
  var text = "yo yo yo this is some text!!!"
  //document.getElementById("textField").innerHTML = text;
  //text.style.display = "block";

  var response = await fetch("https://api.chucknorris.io/jokes/random", {
      method: "GET" // default, so we can ignore
  })
  var exam = await response.json();
  
  var poop = JSON.stringify(exam, undefined, 2);
  var obj = JSON.parse(poop);
  var values = Object.values(obj);

          
  var el = document.getElementById('content');
  var content;
  var rand = Math.floor(Math.random() * 10);

  if  (rand >= 0 && rand < 9) {
      document.getElementById("textField").textContent = obj.value;
  }
  else if  (rand == 9) {
      //document.getElementById("textField").innerHTML = '<div>HAHA GET RICKROLLED</div><iframe width="280" height="157" src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=SXWbX1Ftj_y2tdpO&autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
      document.getElementById("textField").innerHTML = '<div>HAHA GET RICKROLLED</div><video width="320" height="240" autoplay><source src="images/RICKROLL.mp4" type="video/mp4"></video>'

  }

  text.style.display = "block";

}
