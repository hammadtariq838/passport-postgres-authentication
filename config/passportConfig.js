const pool = require("./db.js");

var LocalStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  // register local strategy
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
          );
          if (!user.rows[0]) {
            req.flash("error", "Email not registered");
            return done(null, false);
          }
          if (!(await bcrypt.compare(password, user.rows[0].password))) {
            req.flash("error", "Incorrect password");
            return done(null, false);
          }
          return done(null, user.rows[0]);
        } catch (e) {
          return done(e);
        }
      }
    )
  );

  passport.use(
    "register",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
          );
          if (user.rows[0]) {
            req.flash("error", "Email already registered");
            return done(null, false);
          }
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hashedPassword]
          );
          return done(null, newUser.rows[0]);
        } catch (e) {
          return done(e);
        }
      }
    )
  );

  // update password
  passport.use(
    "updatePassword",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
          );
          if (!user.rows[0]) {
            req.flash("error", "Email not registered");
            return done(null, false);
          }
          if (!(await bcrypt.compare(password, user.rows[0].password))) {
            req.flash("error", "Incorrect password");
            return done(null, false);
          }
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await pool.query(
            "UPDATE users SET password = $1 WHERE email = $2 RETURNING *",
            [hashedPassword, email]
          );
          return done(null, newUser.rows[0]);
        } catch (e) {
          return done(e);
        }
      }
    )
  );

  // serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
      done(null, user.rows[0]);
    } catch (e) {
      done(e);
    }
  });
};
