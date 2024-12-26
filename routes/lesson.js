/************************************************************
 * LESSON ROUTES
 ************************************************************/
const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const LessonCompletion = require("../models/LessonCompletion");

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
 * @param {string} type - e.g., 'lesson'
 * @param {string} id   - e.g., 'lesson1'
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
 * GET /lesson/:lessonId
 * Renders the lesson page for the given lesson ID.
 */
router.get("/:lessonId", checkAuthenticated, (req, res) => {
  res.render("lesson.ejs", { lessonId: req.params.lessonId });
});

/**
 * GET /lesson/api/:lessonId
 * Returns the lesson data as JSON.
 */
router.get("/api/:lessonId", checkAuthenticated, async (req, res) => {
  const lessonData = await loadData("lesson", req.params.lessonId);
  lessonData ? res.json(lessonData) : res.status(404).send("Lesson not found");
});

/**
 * POST /lesson/api/complete-lesson
 * Marks a lesson as completed for the current user.
 */
router.post("/api/complete-lesson", checkAuthenticated, async (req, res) => {
  try {
    await new LessonCompletion({
      userId: req.user._id,
      lessonId: req.body.lessonId,
      completedAt: Date.now(),
    }).save();

    res.status(200).json({ message: "Lesson completed" });
  } catch (error) {
    console.error("Error marking lesson as complete:", error);
    res.status(500).json({ error: "Failed to mark lesson as complete" });
  }
});

/************************************************************
 * EXPORT
 ************************************************************/
module.exports = router;
