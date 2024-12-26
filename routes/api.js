/***************************************************************
 * 1. IMPORTS & SETUP
 ***************************************************************/
const express = require("express");
const router = express.Router();

// Models
const User = require("../models/User");
const QuizResponse = require("../models/QuizResponse");
const LessonCompletion = require("../models/LessonCompletion");
const WritingResponse = require("../models/WritingResponse");
const ListeningResponse = require("../models/ListeningResponse");
const Post = require("../models/Post");

// Middleware for authentication check
const checkAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? next() : res.redirect("/account/login");

/***************************************************************
 * 2. USER / ACCOUNT-RELATED ROUTES
 ***************************************************************/

/**
 * Check if an email is already in use by another User
 *  GET /api/check-email?email=...
 */
router.get("/check-email", async (req, res) => {
  try {
    res.json({ exists: !!(await User.findOne({ email: req.query.email })) });
  } catch (err) {
    console.error("Error checking email:", err);
    res.status(500).json({ error: "Error checking email" });
  }
});

/***************************************************************
 * 3. USER ACTIVITY & HISTORY ROUTES
 ***************************************************************/

/**
 * Get a summary of user activity counts (quizzes, lessons, writings)
 *  GET /api/user-activity
 *  -> returns JSON: { completedQuizzes, completedLessons, completedWritings }
 */
router.get("/user-activity", checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const completedQuizzes = await QuizResponse.countDocuments({ userId });
    const completedLessons = await LessonCompletion.countDocuments({ userId });
    const completedWritings = await WritingResponse.countDocuments({ userId });

    res.json({ completedQuizzes, completedLessons, completedWritings });
  } catch (err) {
    console.error("Error fetching user activity:", err);
    res.status(500).json({ error: "Failed to fetch user activity" });
  }
});

/**
 * Get detailed user history (quizzes, lessons, writings, listenings)
 *  GET /api/user-history
 */
router.get("/user-history", checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const quizzes = await QuizResponse.find({ userId });
    const lessons = await LessonCompletion.find({ userId });
    const writings = await WritingResponse.find({ userId });
    const listenings = await ListeningResponse.find({ userId });

    res.json({ quizzes, lessons, writings, listenings });
  } catch (err) {
    console.error("Error fetching user history:", err);
    res.status(500).json({ error: "Failed to fetch user history" });
  }
});

/***************************************************************
 * 4. FORUM POSTS ROUTES
 ***************************************************************/

/**
 * Get all posts (sorted by latest)
 *  GET /api/posts
 */
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Error fetching posts" });
  }
});

/**
 * Create a new post
 *  POST /api/posts
 */
router.post("/posts", checkAuthenticated, async (req, res) => {
  try {
    const { title, content } = req.body;

    const newPost = new Post({
      title,
      content,
      author: req.user.name, // user name from passport session
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error adding post:", error);
    res.status(500).json({ error: "Error adding post" });
  }
});

/**
 * Delete an existing post (only if user is the author)
 *  DELETE /api/posts/:id
 */
router.delete("/posts/:id", checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author !== req.user.name) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this post" });
    }

    await Post.deleteOne({ _id: id });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "An error occurred while deleting the post." });
  }
});

/***************************************************************
 * 5. POST VOTING (UPVOTE / DOWNVOTE)
 ***************************************************************/
/**
 * Upvote or Downvote a post
 *  PUT /api/posts/:id/vote
 *  Request body: { action: "upvote" | "downvote" }
 */
router.put("/posts/:id/vote", checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user._id; // user ID from session

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const hasUpvoted = post.upvotedBy.includes(userId);
    const hasDownvoted = post.downvotedBy.includes(userId);

    if (action === "upvote") {
      if (hasUpvoted) {
        return res.status(403).json({ error: "You have already upvoted this post." });
      }
      // Add upvote
      post.upvotedBy.push(userId);
      post.votes += 1;

      // Remove downvote if it exists
      if (hasDownvoted) {
        post.downvotedBy.pull(userId);
      }
    } else if (action === "downvote") {
      if (hasDownvoted) {
        return res.status(403).json({ error: "You have already downvoted this post." });
      }
      // Add downvote
      post.downvotedBy.push(userId);
      post.votes -= 1;

      // Remove upvote if it exists
      if (hasUpvoted) {
        post.upvotedBy.pull(userId);
      }
    }

    // Avoid negative vote counts
    if (post.votes < 0) {
      post.votes = 0;
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error("Error updating vote:", error);
    res.status(500).json({ error: "Error updating vote" });
  }
});

/***************************************************************
 * 6. POST REPLIES (COMMENTS) ROUTES
 ***************************************************************/

/**
 * Add a reply to a specific post
 *  POST /api/posts/:id/replies
 */
router.post("/posts/:id/replies", checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const reply = {
      content,
      author: req.user.name,
      timestamp: new Date(),
    };

    // Add reply to post and save
    post.replies.push(reply);
    await post.save();

    // Newly saved reply is last in the replies array
    const savedReply = post.replies[post.replies.length - 1];

    res.status(201).json(savedReply);
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ error: "Error adding reply." });
  }
});

/**
 * Delete a reply by its ID if the user is the author
 *  DELETE /api/posts/:postId/replies/:replyId
 */
router.delete("/posts/:postId/replies/:replyId", checkAuthenticated, async (req, res) => {
  try {
    const { postId, replyId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const reply = post.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ error: "Please refresh the page in remove it" });
    }

    if (reply.author !== req.user.name) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this reply" });
    }

    // Remove the reply subdocument
    await Post.updateOne({ _id: postId }, { $pull: { replies: { _id: replyId } } });

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({ error: "An error occurred while deleting the reply." });
  }
});

/***************************************************************
 * 7. EXPORT THE ROUTER
 ***************************************************************/
module.exports = router;
