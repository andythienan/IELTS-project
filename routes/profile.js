/******************************************************
 * 1. IMPORTS & SETUP
 ******************************************************/
const express = require("express");
const router = express.Router();

// Models
const QuizResponse      = require("../models/QuizResponse");
const LessonCompletion  = require("../models/LessonCompletion");
const WritingResponse   = require("../models/WritingResponse");
const ListeningResponse = require("../models/ListeningResponse");

/******************************************************
 * 2. MIDDLEWARE
 ******************************************************/
/**
 * Checks if user is authenticated.
 * If not, redirect to /account/login
 */
const checkAuthenticated = (req, res, next) => {
  return req.isAuthenticated() ? next() : res.redirect("/account/login");
};

/******************************************************
 * 3. PROFILE ROUTES
 ******************************************************/

/**
 * GET /profile
 * - Displays profile page with user stats (reading quizzes, listening quizzes, lessons, writings).
 * - Renders 'profile.ejs'
 */
router.get("/", checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;

    // Count completed reading quizzes
    const completedReading = await QuizResponse.countDocuments({
      userId,
      quizId: { $regex: /reading/ },
    });

    // Count completed listening quizzes
    const completedListening = await ListeningResponse.countDocuments({
      userId,
      quizId: { $regex: /listening/ },
    });

    // Sum reading + listening to get total completed quizzes
    const completedQuizzes = completedReading + completedListening;

    // Count completed lessons
    const completedLessons = await LessonCompletion.countDocuments({ userId });

    // Count completed writing tasks
    const completedWritings = await WritingResponse.countDocuments({ userId });

    // Render the profile page with all stats
    res.render("profile.ejs", {
      name: req.user?.name || null,
      showHistory: false,
      user: req.user,
      completedReading,
      completedListening,
      completedQuizzes,
      completedLessons,
      completedWritings,
    });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).render("error", { message: "Failed to fetch user activity" });
  }
});

/**
 * GET /profile/history
 * - Renders the same profile page, but with "showHistory" set to true.
 * - Allows display of user history or activity logs.
 */
router.get("/history", checkAuthenticated, (req, res) => {
  res.render("profile.ejs", {
    name: req.user?.name || null,
    showHistory: true,
    user: req.user,
  });
});

/******************************************************
 * 4. EXPORT ROUTER
 ******************************************************/
module.exports = router;
