const express = require('express'),
 morgan = require("morgan"),
 fs = require("fs"),
 path = require("path"),
 bodyParser = require('body-parser'),
 app = express();
 uuid = require('uuid');

 const {check, validationResult } = require('express-validator');

 // cross origin source
const cors = require('cors');
app.use(cors());

// importing models.js file + mongoose
 const mongoose = require('mongoose');
const Models = require('./models.js');
const { error } = require('console');

const Movies = Models.Movie;
const Users = Models.User;
// const Genres = Models.Genre;
// const Directors = Models.Director;

mongoose.connect('mongodb://127.0.0.1:27017/myFlix', {
  useNewUrlParser: true,        // Deprecated, but still supported
  useUnifiedTopology: true,    // Deprecated, but still supported
});


// JSON middleware body parser for requests
app.use(express.urlencoded({ extended: true}));
app.use(bodyParser.json());

// importing authentication middleware
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// Avoiding long list of res.sendFile()
// app.use(express.static('public'));

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// log request setup
// app.use(morgan('combined', {stream: accessLogStream}));

// READ
app.get('/movies', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

// CREATE account for new users
app.post('/users' [

  // Validation logic here for request
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()

], async (req, res) => {

  // check the validation object for errors
  let errors = validationResult(req);
  if (!errors,isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  
  //hashpassword as user enters
  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username }) //Search to see if a user with the requested username already exists
  .then ((user) => {
    if 
    (user) {
      // If the user is found, send a response that it already exists
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
app.put('/users/:Username', passport.authenticate('jwt', { session: false}),
async (req, res) => {
  //CONDITION TO CHECK ADDED HERE
  if(req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }
  //CONDITION ENDS
  await Users.findOneAndUpdate({ Username: req.params.Username}, {
    $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
     { new: true}) //This line makes sure that the updated document is returned
     .then((updatedUser) => {
      res.json(updatedUser);
     })
     .catch((err) => {
      console.log(err);
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


//allows users to delete movies from their favorites
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send("Error: User doesn't exist");
      } else {
        res.json(updatedUser);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//DELETE a user by username
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndDelete({ Username: req.params.Username})
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



//READ
app.get("/movies/:title", async (req, res) => {
 await Movies.findOne({ Title: req.params.title })
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
  await Movies.find({ "Director.Name": req.params.directorName })
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
