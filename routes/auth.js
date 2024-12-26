/************************************************************
 * 1. IMPORTS & SETUP
 ************************************************************/
const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");

/************************************************************
 * 2. MIDDLEWARE
 ************************************************************/
/**
 * Prevents authenticated users from accessing certain routes
 * (e.g., if logged in, don’t go to /login)
 */
const checkNotAuthenticated = (req, res, next) => {
  return req.isAuthenticated() ? res.redirect("/") : next();
};

/************************************************************
 * 3. AUTH ROUTES
 ************************************************************/

/**
 * Login route (Local Strategy)
 *  POST /login
 *  -> successRedirect: "/"
 *  -> failureRedirect: "/account/login"
 */
router.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/account/login",
    failureFlash: true,
  })
);

/**
 * Registration route
 *  POST /register
 *  -> Checks if user exists by email
 *  -> Hashes password & saves new user
 */
router.post("/register", checkNotAuthenticated, async (req, res) => {
  const { name, email, password, gender } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "User with this email already exists.");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ name, email, password: hashedPassword, gender }).save();

    res.redirect("/account/login");
  } catch (err) {
    console.error("Error registering user:", err);
    req.flash("error", "Error during registration.");
    res.redirect("/register");
  }
});

/**
 * Logout route
 *  DELETE /logout
 */
router.delete("/logout", (req, res, next) =>
  req.logOut((err) => (err ? next(err) : res.redirect("/")))
);

/************************************************************
 * 4. EXPORT ROUTER
 ************************************************************/
module.exports = router;
