const express = require('express');
const app = express();
const port = 3000;

// Define a route to handle the button click
app.get('/displayText', (req, res) => {
    // Execute your desired action (e.g., send text)
    const textToDisplay = 'Hello from the server!';
    res.send(textToDisplay);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});