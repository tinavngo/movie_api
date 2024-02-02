const express = require('express'),
 morgan = require("morgan"),
 fs = require("fs"),
 path = require("path"),
 bodyParser = require('body-parser'),
 app = express();
 uuid = require('uuid');



//JSON middleware body parser for requests
app.use(bodyParser.json());
//app.use(bodyParser.urlendcoded({ extended: true}));

let users = [
  {
    id: 1,
    name:"Kim",
    favoriteMovies: ['Perfect Blue']
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: []
  },
]
let movies = [
  {
    'Title': "Curse of the Blair Witch",
    'Description' : "The uncensored investigation into disappearances of the three film-makers in 1994. See interviews with friends and family of the three film-makers, and learn the entire mythology of the Blair Witch, including a news reel interview with Rustin Parr.",

    'Genre': {
      'Name' : "Horror",
      'Description' : "Horror is a film genre that seeks to elicit fear or disgust in its audience for entertainment purposes.",
    },

    'Director': {
      'Name' : "Daniel Myrick",
      'Bio' : "Daniel Myrick is an American film director, most famous for horror films, especially for co-directing and writing the 1999 psychological horror The Blair Witch Project with Eduardo Sánchez. They won the Independent Spirit John Cassavetes Award for this film.",
      'Birth' : "September 3, 1963",
    },

    'releaseDate' : "July 11, 1999",

  },
  {
    'Title': "Perfect Blue",
    'Description' : "A young Japanese singer is encouraged by her agent to quit singing and pursue an acting career, beginning with a role in a murder mystery TV show.",

    'Genre': {
      'Name' : "Mystery",
      'Description' : "A mystery film is a genre of film that revolves around the solution of a problem or a crime.",
    },

    'Director': {
      'Name' : "Satoshi Kon",
      'Bio' : "Satoshi Kon was a Japanese film director, animator, screenwriter and manga artist from Sapporo, Hokkaido, and a member of the Japanese Animation Creators Association. He was a graduate of the Graphic Design department of the Musashino Art University.",
      'Birth' : "October 12, 1963 - August 24, 2010",
    },

    'releaseDate' : "August 20, 1999",

  },
  {
    'Title': "Blade Runner 2049",
    'Description' : "Officer K (Ryan Gosling), a new blade runner for the Los Angeles Police Department, unearths a long-buried secret that has the potential to plunge what's left of society into chaos. His discovery leads him on a quest to find Rick Deckard (Harrison Ford), a former blade runner who's been missing for 30 years.",

    'Genre': {
      'Name' : "Thriller",
      'Description' : "Thriller is a genre of fiction with numerous, often overlapping, subgenres, including crime, horror, and detective fiction.",
    },

    'Director': {
      'Name' : "Denis Villeneuve",
      'Bio' : "Denis Villeneuve OC CQ RCA is a Canadian filmmaker. He is a four-time recipient of the Canadian Screen Award for Best Direction, winning for Maelström in 2001, Polytechnique in 2009, Incendies in 2010 and Enemy in 2013.",
      'Birth' : "October 3, 1967",
    },

    'releaseDate' : "October 6, 2017",

  },
  {
    'Title': "Fear and Loathing in Las Vegas",
    'Description' : "Raoul Duke (Johnny Depp) and his attorney Dr. Gonzo (Benicio del Toro) drive a red convertible across the Mojave desert to Las Vegas with a suitcase full of drugs to cover a motorcycle race. As their consumption of drugs increases at an alarming rate, the stoned duo trash their hotel room and fear legal repercussions. Duke begins to drive back to L.A., but after an odd run-in with a cop (Gary Busey), he returns to Sin City and continues his wild drug binge.",

    'Genre': {
      'Name' : "Comedy",
      'Description' : "A comedy film is a category of film that emphasizes humor. These films are designed to amuse audiences and make them laugh.",
    },

    'Director': {
      'Name' : "Terry Gilliam",
      'Bio' : "Terrence Vance Gilliam is an American–born British filmmaker, comedian, collage animator and actor. He gained stardom as a member of the Monty Python comedy troupe alongside John Cleese, Eric Idle, Michael Palin, Terry Jones, and Graham Chapman.",
      'Birth' : "	22 November 1940 ",
    },

    'releaseDate' : "May 19, 1998",

  },
  {
    'Title': "Once Upon a Time... in Hollywood",
    'Description' : "Actor Rick Dalton gained fame and fortune by starring in a 1950s television Western, but is now struggling to find meaningful work in a Hollywood that he doesn't recognize anymore. He spends most of his time drinking and palling around with Cliff Booth, his easygoing best friend and longtime stunt double. Rick also happens to live next door to Roman Polanski and Sharon Tate -- the filmmaker and budding actress whose futures will forever be altered by members of the Manson Family.",

    'Genre': {
      'Name' : "Comedy",
      'Description' : "A comedy film is a category of film that emphasizes humor. These films are designed to amuse audiences and make them laugh.",
    },

    'Director': {
      'Name' : "Quentin Tarantino",
      'Bio' : "Quentin Jerome Tarantino is an American film director, screenwriter, and actor. His films are characterized by stylized violence, extended dialogue including a pervasive use of profanity, and references to popular culture.",
      'Birth' : "March 27, 1963",
    },

    'releaseDate' : "July 26, 2019",

  },
];



//Avoiding long list of res.sendFile()
app.use(express.static('public'));

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// log request setup
app.use(morgan('combined', {stream: accessLogStream}));

//CREATE
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  }else{
    res.status(400).send('User need names')
  }
})

//UPDATE
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  
  let user = users.find( user => user.id == id );

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }
})

//CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  
  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})

//DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  
  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle); //strict equality, if not equal to, then do not show/remove
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})


//DELETE
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  
  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter( user => user.id != id); // non strict equality because string and number
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }
})

// READ aka GET requests
app.get("/", (req, res) => {
  let responseText = "Welcome to myFlix app!";
  res.send(responseText);
});

//READ
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

//READ
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title );

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie')
  }
});

//READ
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre')
  }
});

//READ
app.get("/movies/director/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director')
  }
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
