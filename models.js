/**
 * @file Defines Mongoose schemas for movies, users, and directors.
 * Implements password hashing and validation using bcrypt.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Movie schema
 * 
 * Defines the structure of a movie document, including details such as title, description, MPAARating, etc.
 * 
 * @property {string} Title - The title of the movie.
 * @property {string} Description - The description or summary of the movie.
 * @property {string} MPAARating - The MPAA rating of the movie (e.g., PG-13, R).
 * @property {string} ReleaseYear - The year the movie was released.
 * @property {Object} Genre - The genre of the movie, including name and description.
 * @property {Object} Director - The director of the movie, including name and bio.
 * @property {string[]} Actors - An array of actors featured in the movie.
 * @property {string} ImagePath - URL or path to the movie's image.
 * @property {boolean} Featured - Boolean indicating if the movie is featured.
 */
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    MPAARating: {type: String, required: true},
    ReleaseYear: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: { type: String, required: true},
    Featured: Boolean
});

/**
 * User Schema
 * 
 * Defines the structure of a user document, including username, password, email, birthday,
 * and a list of favorite movies.
 *
 * @property {string} Username - The user's username.
 * @property {string} Password - The user's hashed password.
 * @property {string} Email - The user's email address.
 * @property {Date} Birthday - The user's birthday.
 * @property {ObjectId[]} FavoriteMovies - An array of movie IDs that the user has marked as favorite.
 */
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

let directorSchema = mongoose.Schema({
    Name: {String},
    Bio: {String},
    Birth: {type: Date},
    Death: {type: Date}
})
//password hashing
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

//comparing submitted hashed passwords with the hashed passwords stored in the database
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

//creation of models
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Director = mongoose.model('Director', directorSchema);

//exporting the models
module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Director = Director;
