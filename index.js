const express = require('express');
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const app = express();

const moviesList = [
  {
    title: "film 1",
    director: "director 1",
  },
  {
    title: "film 2",
    director: "director 2",
  },
  {
    title: "film 3",
    director: "director 3",
  },
  {
    title: "film 4",
    director: "director 4",
  },
  {
    title: "film 5",
    director: "director 5",
  },
];

//Avoiding long list of res.sendFile()
app.use(express.static('public'));

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// GET requests
app.get("/", (req, res) => {
  let responseText = "Welcome to myFlix app!";
  res.send(responseText);
});

app.get("/movies", (req, res) => {
  res.json(moviesList);
});

//error handling middleware function
//should be last, but before app.listen()
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("something broke");
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
