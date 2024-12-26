/************************************************************
 * WRITING ROUTES
 ************************************************************/
const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const WritingResponse = require("../models/WritingResponse");

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
 * @param {string} type - e.g., 'writing'
 * @param {string} id   - e.g., 'writing1'
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
 * GET /writing/:taskId
 * Renders a writing page for the given task ID.
 */
router.get("/:taskId", checkAuthenticated, (req, res) => {
  res.render("writing.ejs", { taskId: req.params.taskId });
});

/**
 * GET /writing/api/:taskId
 * Serves the writing task data as JSON.
 */
router.get("/api/:taskId", checkAuthenticated, async (req, res) => {
  const taskData = await loadData("writing", req.params.taskId);
  taskData ? res.json(taskData) : res.status(404).send("Task not found");
});

/**
 * POST /writing/submit-writing
 * Submits a user's writing response.
 */
router.post("/submit-writing", checkAuthenticated, async (req, res) => {
  try {
    const { task, response, wordCount } = req.body;
    await new WritingResponse({
      userId: req.user._id,
      task,
      response,
      wordCount,
    }).save();

    return res
      .status(200)
      .json({ message: "Writing response submitted successfully." });
  } catch (error) {
    console.error("Error saving writing response:", error);
    return res.status(500).json({ error: "Failed to save writing response." });
  }
});

/************************************************************
 * EXPORT
 ************************************************************/
module.exports = router;
