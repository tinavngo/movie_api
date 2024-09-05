/**
 * @file Authentication using passport.js with Localstrategy and JWTStrategy.
 * Configures passport.js to handle user authentication through both a local strategy
 * (username/password) and a JWT (JSON Web Token strategy)
 */
const passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
Models = require('./models.js'),
passportJWT = require('passport-jwt');

let Users = Models.User,
JWTStrategy = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJwt;


/**
 * Passport Local Strategy for username and password login.
 * 
 * This strategy checks for the user in the database by their username and validates
 * the provided password. If the username or password is incorrect, the login fails.
 *
 * @param {Object} options - Options for the LocalStrategy.
 * @param {string} options.usernameField - Field name in the request for the username.
 * @param {string} options.passwordField - Field name in the request for the password.
 * @param {Function} verify - A callback function for the verification process.
 * @param {string} username - Username entered by the user.
 * @param {string} password - Password entered by the user.
 * @param {Function} callback - A callback function to be called once verification is complete.
 */
passport.use(
    new LocalStrategy(
        {
            usernameField: 'Username',
            passwordField: 'Password',
        },
        async (username, password, callback) => {
            console.log("${username} ${password}");
            await Users.findOne({ Username: username })
            .then((user) => {
                if (!user) {   //when username cannot be found within the DB
                    console.log('Incorrect username');
                    return callback(null, false, {
                        message: 'Incorrect username or password.',
                    });
                }
                if (!user.validatePassword(password)) {
                    console.log('incorrect password');
                    return callback(null,false, { message: 'Incorrect password.'
                });
                }
                console.log('unfinished');
                return callback(null, user);
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                    return callback(error);
                }
            });
        }
    )
);


/**
 * Passport JWT Strategy for handling JWT-based authentication.
 * 
 * This strategy verifies the JWT token sent in the Authorization header and extracts
 * the user ID from the payload. The user is then fetched from the database.
 *
 * @param {Object} options - Options for the JWT strategy.
 * @param {Function} options.jwtFromRequest - Function to extract the JWT from the request header.
 * @param {string} options.secretOrKey - The secret key to verify the JWT signature.
 * @param {Function} verify - A callback function for the verification process.
 * @param {Object} jwtPayload - The decoded JWT payload containing the user information.
 * @param {Function} callback - A callback function to be called once verification is complete.
 */
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), //bearer token
    secretOrKey: 'your_jwt_secret' //signature
}, async (jwtPayload, callback) => {
    return await Users.findById(jwtPayload._id)
    .then((user) => {
        return callback(null, user);
    })
    .catch((error) => {
        return callback(error)
    });
}));