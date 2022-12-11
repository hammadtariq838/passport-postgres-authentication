const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (user.rows[0]) {
        req.flash("error", "Email already registered");
        return res.redirect("/register");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
        [username, email, hashedPassword]
      );
      req.login(newUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to YelpCamp!");
        res.redirect("/campgrounds");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
    "/login",
    catchAsync(async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
            if (!user.rows[0]) {
                req.flash("error", "Email not registered");
                return res.redirect("/login");
            }
            if (!(await bcrypt.compare(password, user.rows[0].password))) {
                req.flash("error", "Incorrect password");
                return res.redirect("/login");
            }
            req.login(user, (err) => {
                if (err) return next(err);
                req.flash("success", "Welcome back!");
                res.redirect("/campgrounds");
            });
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("login");
        }
    })
);

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
});

module.exports = router;
