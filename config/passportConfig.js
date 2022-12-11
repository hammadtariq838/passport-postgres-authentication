const pool = require("./db.js");

var LocalStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  passport.use(
    "login",
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      function (req, username, password, done) {
        loginUser();
        async function loginUser() {
          const client = await pool.connect();
          client.query(
            'SELECT id, "username", "password" FROM "users" WHERE "username"=$1',
            [username],
            (err, result) => {
              if (err) {
                return done(err);
              }

              if (result.rows[0] == null) {
                return done(
                  null,
                  false,
                  req.flash("message", "Incorrect username or password")
                );
              } else {
                return done(
                  null,
                  result.rows[0],
                  req.flash("message", "Logged in successfully")
                );
              }
            }
          );
        }
      }
    )
  );

  passport.use(
    "register",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true,
      },
      function (req, username, password, done) {
        registerUser();
        async function registerUser() {
          const client = await pool.connect();
          client.query(
            "SELECT id FROM users WHERE username=($1)",
            [req.body.username],
            (err, result) => {
              if (err) {
                return done(err);
              }
              if (result.rows[0]) {
                return done(
                  null,
                  false,
                  req.flash("message", "Sorry, this username is already taken.")
                );
              } else {
                client.query(
                  "INSERT INTO users (username, password) VALUES ($1, $2)",
                  [req.body.username, password],
                  (err, result) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log(
                        "User [" + req.body.username + "] has registered."
                      );
                      return done(null, { username: req.body.username });
                    }
                  }
                );
              }
            }
          );
        }
      }
    )
  );

  passport.use(
    "updatePassword",
    new LocalStrategy(
      {
        usernameField: "password",
        passwordField: "newpass",
        passReqToCallback: true,
      },
      function (req, password, newpass, done) {
        updatePassword();
        async function updatePassword() {
          const client = await pool.connect();
          client.query(
            'SELECT id, "username", "password" FROM "users" WHERE "username"=$1',
            [req.user.username],
            (err, result) => {
              if (err) {
                return done(err);
              }

              if (result.rows[0] == null) {
                return done(
                  null,
                  false,
                  req.flash(
                    "message",
                    "Error on changing password. Please try again"
                  )
                );
              } else {
                client.query(
                  "UPDATE users SET password=($1) WHERE username=($2)",
                  [newpass, req.user.username],
                  (err, result) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log(
                        "User [" +
                          req.user.username +
                          "] has updated their password."
                      );
                      return done(
                        null,
                        { username: req.user.username },
                        req.flash("message", "Your password has been updated.")
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    )
  );
};
