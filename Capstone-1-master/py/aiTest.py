from openai import OpenAI
from gtts import gTTS
import os
from playsound import playsound


class OpenAiManager:
    
    def __init__(self):
        self.chat_history = [] # Stores the entire conversation
        try:
            self.client = OpenAI(api_key="xxxxxxxxxxxxxxxxxxxxxxxxx")
        except TypeError:
            exit("Ooops! You forgot to set OPENAI_API_KEY in your environment!")

    # Asks a question with no chat history
    def chat(self, prompt=""):
        if not prompt:
            print("Didn't receive input!")
            return

        # Check that the prompt is under the token context limit
        chat_question = [{"role": "user", "content": prompt}]


        print("Asking ChatGPT a question...")
        completion = self.client.chat.completions.create(
          model="gpt-3.5-turbo",
          messages=chat_question
        )

        # Process the answer
        openai_answer = completion.choices[0].message.content
        print(f"{openai_answer}\n")
        return openai_answer

    # Asks a question that includes the full conversation history
    def chat_with_history(self, prompt=""):
        if not prompt:
            print("Didn't receive input!")
            return

        # Add our prompt into the chat history
        self.chat_history.append({"role": "user", "content": prompt})


        print("[yellow]\nAsking ChatGPT a question...")
        completion = self.client.chat.completions.create(
          model="gpt-4",
          messages=self.chat_history
        )

        # Add this answer to our chat history
        self.chat_history.append({"role": completion.choices[0].message.role, "content": completion.choices[0].message.content})

        # Process the answer
        openai_answer = completion.choices[0].message.content
        print(f"{openai_answer}\n")
        return openai_answer
    
    
    def textToSpeech(self, aiResponse):
        speech = gTTS(text=aiResponse, lang='en', slow=False)
        speech.save("audio.mp3")
        playsound("audio.mp3")
        os.remove("audio.mp3")



if __name__ == '__main__':
    openai_manager = OpenAiManager()

    # CHAT TEST
    #question = input("Ask ChatGPT a question: ")
    question = "what is 2 plus 2"
    aiResponse = openai_manager.chat(question)
    openai_manager.textToSpeech(aiResponse)
        