// routes/forum.js
const express = require("express");
const router = express.Router();

// Middleware
const checkAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? next() : res.redirect("/account/login");

// Utility Functions
const renderPage = (page) => (req, res) =>
  res.render(`${page}.ejs`, { name: req.user?.name || null });

// Forum Route
router.get("/", checkAuthenticated, renderPage("forum"));

module.exports = router;