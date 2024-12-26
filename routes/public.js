// routes/public.js
const express = require("express");
const router = express.Router();

// Utility Functions (Moved from server.js)
const renderPage = (page) => (req, res) =>
  res.render(`${page}.ejs`, { name: req.user?.name || null });

// Public Routes
router.get("/", renderPage("index"));
router.get("/about-us", renderPage("about-us"));
router.get("/vocabulary", renderPage("vocab"));
router.get("/skills", renderPage("skills"));
router.get("/tips", renderPage("tips"));

module.exports = router;