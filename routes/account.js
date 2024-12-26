// routes/account.js
const express = require("express");
const router = express.Router();

// Middleware
const checkNotAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? res.redirect("/") : next();

// Account Routes
router.get("/:formType", checkNotAuthenticated, (req, res) => {
  const { formType } = req.params;
  if (formType === "login" || formType === "register") {
    res.render("account.ejs", {
      formType,
      activeTab: formType,
      name: req.user?.name || null,
    });
  } else {
    res.status(404).send("Page not found");
  }
});

module.exports = router;