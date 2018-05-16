// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
const mysql = require('mysql');

// load up the user model
// var User            = require('../app/models/user');

function getAtheleteProfileFromDatabase(athleteID) {
    let query = "SELECT `ai`.`first_name`, `ai`.`last_name`, `ai`.`height`, " +
        "`ai`.`weight`, `ai`.`img_url`,`ai`.`age`, `a`.`athlete_id`," +
        "`s`.`stat_name`, `s`.`stat_value` " +
        "FROM `athlete_info` AS ai " +
        "JOIN `athletes` AS a " +
        "ON `ai`.`athlete_info_id` = `a`.`athlete_info_id` " +
        "JOIN `stats` as s " +
        "ON `a`.`athlete_id` = `s`.`athlete_id` " +
        "WHERE `ai`.`user_id` = ? ";
    let inserts = [athleteID];

    return mysql.format(query, inserts);
}

// expose this function to our app using module.exports
module.exports = function(passport, app, dataBase, mysql) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user[0].athlete_id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {

        let sql = "SELECT * FROM ?? WHERE ?? = ?";
        let inserts = ['athletes', 'athlete_id', id];
        sql = mysql.format(sql, inserts);

        dataBase.query(sql,
            function (err, results, fields) {
                console.log('KEITH HERE!', results[0]);
                done(err, results[0].athlete_id)
            }
        );
        // User.findById(id, function(err, user) {
        //     done(err, user);
        // });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {

            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function() {

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists

                let sql  = getAtheleteProfileFromDatabase('2');

                dataBase.query(sql, function(err, results, fields) {
                    console.log('hey, Keith, Here', results[0]);
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email

                    if(results[0]){
                        return done(null, false);
                    } else {

                        console.log('No user, must make new one')





                        // // if there is no user with that email
                        // // create the user
                        // var newUser            = new User();
                        //
                        // // set the user's local credentials
                        // newUser.local.email    = email;
                        // newUser.local.password = newUser.generateHash(password);
                        //
                        // // save the user
                        // newUser.save(function(err) {
                        //     if (err)
                        //         throw err;
                        //     return done(null, newUser);
                        // });
                    }

                });

            });

        }));

    passport.use('local-signin', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) { // callback with email and password from our form
            let sql = getAtheleteProfileFromDatabase('2');

            dataBase.query(sql, function (err, results, fields) {
                console.log('User does exist, Keith', results[0]);

                if (err) { return done(err); }

                if (!results[0]) { return done(null, false); }

                // if (!crypt.checkPassword(password, results[0].password)) { return done(null, false); }
                return done(null, results);
            });
        }));

};
