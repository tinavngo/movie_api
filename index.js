const express = require('express'),
 morgan = require("morgan"),
 fs = require("fs"),
 path = require("path"),
 bodyParser = require('body-parser'),
 app = express();
 uuid = require('uuid');

//importing models.js file + mongoose
 const mongoose = require('mongoose');
const Models = require('./models.js');
const { error } = require('console');

const Movies = Models.Movie;
const Users = Models.User;
//const Genres = Models.Genre;
//const Directors = Models.Director;

mongoose.connect('mongodb://localhost:27017/myFlix', 
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//JSON middleware body parser for requests
app.use(express.urlencoded({ extended: true}));
app.use(bodyParser.json());

//app.use(bodyParser.urlendcoded({ extended: true}));

//Avoiding long list of res.sendFile()
//app.use(express.static('public'));

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// log request setup
//app.use(morgan('combined', {stream: accessLogStream}));

//CREATE
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
  .then ((user) => {
    if 
    (user) {
      return res.status(400).send(req.body.Username + 'already exists');
    } else {
      Users
      .create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then ((user) => {res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Erorr: ' + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
});

//READ Get all users
app.get('/users', async (req, res) => {
  await Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:' + err);
  });
});

//READ Get a user by username
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
  .then ((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//UPDATE a user's info, by username
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, 
    {$set: {

      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday

  }
},
{ new: true}) // This line makes sure that the updated document is returned
.then((updatedUser) => {
  res.json(updatedUser);
})
.catch((err) => {
  console.error(err);
  res.status(500).send('Error: ' + err);
})
});


//CREATE Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate ({ Username: req.params.Username }, 
    {
    $push: { FavoriteMovies: req.params.MovieID }
  },

  { new: true })// This line makes sure that the updated document is returned

  .then((updatedUser) => {
    res.json(updatedUser);
  })

  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  
  const user = Users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle); //strict equality, if not equal to, then do not show/remove
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})


//DELETE a user by username
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndRemove ({ Username: req.params.Username})
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + 'was not found');
    } else {
      res.status(400).send(req.params.Username + 'was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: '+ err);
  });
});

// READ aka GET requests
app.get("/", (req, res) => {
  let responseText = "Welcome to myFlix app!";
  res.send(responseText);
});

//READ return JSON object when at /movies
app.get("/movies", async (req, res) => {
  await Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});


//READ
app.get("/movies/:title", async (req, res) => {
 await Movies.findOne({ title: req.params.title })
 .then((movie) => {
  res.json(movie);
 })
 .catch((err) => {
  console.error(err);
  res.status(500).send("Error: " + err);
 });
});

//READ
app.get("/movies/genre/:genreName", async (req, res) => {
  await Movies.findOne({ "Genre.Name": req.params.genreName })
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//READ
app.get("/movies/director/:directorName", async (req, res) => {
  await Movies.findOne({ "Director.NAme": req.params.directorName })
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
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
