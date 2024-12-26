/************************************************************
 * READING ROUTES
 ************************************************************/
const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const QuizResponse = require("../models/QuizResponse");

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
 * @param {string} type - e.g., 'reading'
 * @param {string} id   - e.g., 'reading1'
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
 * GET /reading/:quizId
 * Renders the reading test page for a given quiz ID.
 */
router.get("/:quizId", checkAuthenticated, (req, res) => {
  res.render("reading.ejs", { quizId: req.params.quizId });
});

/**
 * GET /reading/api/:quizId
 * Serves the reading quiz data as JSON.
 * Some quiz IDs may contain 'reading-quiz/' prefix, so it removes that part first.
 */
router.get("/api/:quizId", checkAuthenticated, async (req, res) => {
  const id = req.params.quizId.replace("reading-quiz/", "");
  console.log({
    requestedId: id,
    currentDir: __dirname,
    attempting: `Loading reading quiz with ID: ${id}`,
  });

  const quizData = await loadData("reading", id);
  if (quizData) {
    console.log("Quiz data found");
    res.json(quizData);
  } else {
    console.error("Quiz not found for ID:", id);
    res.status(404).send("Quiz not found");
  }
});

/**
 * POST /reading/submit-quiz
 * Submits a reading quiz response to the database.
 */
router.post("/submit-quiz", checkAuthenticated, async (req, res) => {
  try {
    console.log("Received quiz submission:", req.body);
    await new QuizResponse(req.body).save();
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
