/************************************************************
 * LISTENING ROUTES
 ************************************************************/
const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const ListeningResponse = require("../models/ListeningResponse");

/************************************************************
 * MIDDLEWARE
 ************************************************************/
const checkAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? next() : res.redirect("/account/login");

/************************************************************
 * UTILITY FUNCTIONS
 ************************************************************/
/**
 * Loads data for a given `type` and `id` from JSON in `data/`
 * @param {string} type - e.g., 'listening'
 * @param {string} id   - e.g., 'listening1'
 * @returns {Object|null} parsed JSON data or null if failed
 */
const loadData = async (type, id) => {
  let filePath = "";
  try {
    filePath = path.resolve(__dirname, "../data", type, `${id}.json`);
    console.log(`Loading data from: ${filePath}`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${type} data from ${filePath}:`, error.message);
    return null;
  }
};

/************************************************************
 * ROUTES
 ************************************************************/

/**
 * GET /listening/:testId
 * Renders a listening test page for the given test ID.
 */
router.get("/:testId", checkAuthenticated, (req, res) => {
  res.render("listening.ejs", { testId: req.params.testId });
});

/**
 * GET /listening/api/:testId
 * Serves listening test data as JSON.
 */
router.get("/api/:testId", checkAuthenticated, async (req, res) => {
  const testData = await loadData("listening", req.params.testId);
  testData ? res.json(testData) : res.status(404).send("Test not found");
});

/**
 * POST /listening/submit-quiz
 * Submits a listening quiz response to the database.
 */
router.post("/submit-quiz", checkAuthenticated, async (req, res) => {
  try {
    console.log("Received quiz submission:", req.body);
    await new ListeningResponse(req.body).save();
    res.status(200).json({ message: "Quiz response submitted successfully." });
  } catch (error) {
    console.error("Error saving quiz response:", error);
    res.status(500).json({ error: "Failed to save quiz response." });
  }
});

/************************************************************
 * EXPORT
 ************************************************************/
module.exports = router;
