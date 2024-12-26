// routes/library.js
const express = require("express");
const router = express.Router();

// Middleware
const checkAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? next() : res.redirect("/account/login");

// Library Route
router.get("/", checkAuthenticated, (req, res) =>
  res.render("library.ejs", {
    type: req.query.type,
    name: req.user?.name || null,
  })
);

module.exports = router;