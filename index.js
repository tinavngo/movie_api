// Requirements
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require("path");
const bodyParser = require('body-parser');
const uuid = require('uuid');
const { check, validationResult } = require('express-validator');

// Importing models.js file + mongoose
const mongoose = require('mongoose');
const Models = require('./models.js');

// Mongoose Models
const Movies = Models.Movie;
const Users = Models.User;


/*
//local database
mongoose.connect('mongodb://127.0.0.1:27017/myFlix', {useNewUrlParser: true, useUnifiedTopology: true});
*/

/**
 * Online database
 */
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/**
 * Create web server
 */
app = express();

/**
 * Middleware to parse incoming request bodies as JSON
 */
app.use(morgan('common'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Cross Origin Resource Sharing
 */
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'https://cinematflix.netlify.app','https://tinavngo.github.io']
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn't found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));


/**
 * Create write strean to "log.txt"
 */
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })


// Morgan setup
app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.json());

// Import authentication, and passport module
let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport');

// Set Up Logger
let Logger = (req, res, next) => {
  console.log(req.url);
  next();
};

app.use(Logger);

// Welcome route  
app.get(
  "/", (req, res) => {
    res.send("Welcome to tinFlicks API!");
  });

// READ -- Get movies must auth x
app.get(
  '/movies',
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// READ -- Get movie title must auth x
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// READ -- Get users must auth x
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error:' + err);
      });
  }
);

// CREATE -- account for new users x
app.post(
  '/users', (req, res) => {
    [   // Validation logic here for request
      check('Username', 'Username is required').isLength({ min: 5 }),
      check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
      check('Password', 'Password is required').not().isEmpty(),
      check('Email', 'Email does not appear to be valid').isEmail()
    ],
      (req, res) => {
        let errors = validationResult(req); // check the validation object for errors
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }
      }

    let hashedPassword =
      Users.hashPassword(req.body.Password); // hashpassword as user enters
    Users.findOne({ Username: req.body.Username }) //Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          // If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({ // Mongoose's create command creates a new user if username is not already in DB 
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      })
  });

//UPDATE -- user's info, by username  must auth x
app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    [
      // Validation logic here for request
      check('Username', 'Username is required').isLength({ min: 5 }),
      /* check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
       check('Password', 'Password is required').not().isEmpty(),
       check('Email', 'Email does not appear to be valid').isEmail()*/
    ],

      (req, res) => {
        // check the validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }
      }
      let data = {
        Username: req.body.Username,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
      
      req.body.Password && (data.Password = Users.hashPassword(req.body.Password));

      Users.findOneAndUpdate(
        {Username: req.params.Username},
        { $set: data },
        { new: true }, //This line makes sure that the updated document is returned
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          console.error(err);
          return res.status(404).send('Error: Username already exists');
        } else {
          res.json(updatedUser);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// READ -- all users
app.get('/users',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// READ -- user by username
app.get('/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

//CREATE -- favorite movies
app.post(
  '/users/:Username/movies/:movieID',
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate(
      { Username: req.params.Username }, {
      $push: { FavoriteMovies: req.params.movieID }
    },
      { new: true })// Makes sure that the updated document is returned
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


// DELETE -- favorite movies
app.delete(
  '/users/:Username/movies/:movieID',
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate(
      { Username: req.params.Username }, {
      $pull: { FavoriteMovies: req.params.movieID }
    },
      { new: true }) // This line makes sure that the updated document is returned
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


//DELETE a user by username must auth x
app.delete(
  '/users/:Username',
  passport.authenticate("jwt", { session: false }),
   async (req, res) => { 
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
     await Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(404).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });


//READ -- Get genre by genrename must auth x
app.get(
  "/movies/genres/:genreName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find({ "Genre.Name": req.params.genreName })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

//READ -- Get director by directorname must auth x
app.get(
  "/movies/directors/:directorName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find({ "Director.Name": req.params.directorName })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

// Static file
app.use(
  "/documentation",
  express.static("public", { index: "documentation.html" })
);

// Error handling middleware function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("something broke!");
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});