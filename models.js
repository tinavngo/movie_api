const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
