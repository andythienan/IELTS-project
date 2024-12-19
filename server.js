// server.js
if (process.env.NODE_ENV !== "production") require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const path = require("path");

// Models
const User = require("./models/User");
const WritingResponse = require("./models/WritingResponse");
const ListeningResponse = require("./models/ListeningResponse");
const QuizResponse = require("./models/QuizResponse");
const LessonCompletion = require("./models/LessonCompletion");

// Passport configuration
const initializePassport = require("./passport-config");

// Post Schema
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  votes: { type: Number, default: 0 },
  category: { type: String, default: "new" },
  timestamp: { type: Date, default: Date.now },
  replies: [
    {
      content: { type: String, required: true },
      author: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});
const Post = mongoose.model("Post", PostSchema);

// Database connection
const DB_URI =
  "mongodb+srv://Mikeblocky:iamawizardty%3AD%21@learnenglish.tnwoh.mongodb.net/?retryWrites=true&w=majority&appName=learnEnglish";

mongoose
  .connect(DB_URI, { dbName: "myDatabase" })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();

// Middleware
app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(flash());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "some-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport Initialization
initializePassport(
  passport,
  (email) => User.findOne({ email }).catch(() => null),
  (id) => User.findById(id).catch(() => null)
);
app.use(passport.initialize());
app.use(passport.session());

// User Context Middleware
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Authentication Middleware
const checkAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? next() : res.redirect("/account/login");
const checkNotAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? res.redirect("/") : next();

// Utility Functions
const renderPage = (page) => (req, res) =>
  res.render(`${page}.ejs`, { name: req.user?.name || null });

const loadData = async (type, id) => {
  try {
    const filePath = path.join(__dirname, "data", type, `${id}.json`);
    return JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch (error) {
    console.error(`Error loading ${type} data:`, error);
    return null;
  }
};

// Routes
// Public Routes
app.get("/", renderPage("index"));
app.get("/about-us", renderPage("about-us"));
app.get("/vocabulary", renderPage("vocab"));
app.get("/skills", renderPage("skills"));
app.get("/tips", renderPage("tips"));

// Authenticated Routes
app.get("/library", checkAuthenticated, (req, res) =>
  res.render("library.ejs", {
    type: req.query.type,
    name: req.user?.name || null,
  })
);
// Profile Route (now handles both profile and history)
app.get("/profile", checkAuthenticated, async (req, res) => {
  try {
      // Fetch user activity data (similar to what you do in /api/user-activity)
      const userId = req.user._id;
      const completedQuizzes = await QuizResponse.countDocuments({ userId });
      const completedLessons = await LessonCompletion.countDocuments({ userId });
      const completedWritings = await WritingResponse.countDocuments({ userId });

      res.render("profile.ejs", {
          name: req.user?.name || null,
          showHistory: false, // Flag to indicate we're on the main profile page
          user: req.user,
          completedQuizzes, // Pass the fetched data to the template
          completedLessons,
          completedWritings,
      });
  } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).render("error", { message: "Failed to fetch user activity" });
  }
});

app.get("/profile/history", checkAuthenticated, (req, res) => {
  res.render("profile.ejs", {
    name: req.user?.name || null,
    showHistory: true, // Flag to indicate we're on the history subpage
    user: req.user,
  });
});
app.get("/forum", checkAuthenticated, renderPage("forum"));

// Account Routes
app.get("/account/:formType", checkNotAuthenticated, (req, res) => {
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

// Lesson Routes
app.get("/lesson/:lessonId", checkAuthenticated, (req, res) =>
  res.render("lesson.ejs", { lessonId: req.params.lessonId })
);
app.get("/api/lesson/:lessonId", checkAuthenticated, async (req, res) => {
  const lessonData = await loadData("lesson", req.params.lessonId);
  lessonData
    ? res.json(lessonData)
    : res.status(404).send("Lesson not found");
});
app.post("/api/complete-lesson", checkAuthenticated, async (req, res) => {
  try {
    await new LessonCompletion({
      userId: req.user._id,
      lessonId: req.body.lessonId,
    }).save();
    res.status(200).json({ message: "Lesson completed" });
  } catch (error) {
    console.error("Error marking lesson as complete:", error);
    res.status(500).json({ error: "Failed to mark lesson as complete" });
  }
});

// Listening Test Routes
app.get("/listening/:testId", checkAuthenticated, (req, res) =>
  res.render("listening.ejs", { testId: req.params.testId })
);
app.get(
  "/api/listening-test/:testId",
  checkAuthenticated,
  async (req, res) => {
    const testData = await loadData("listening", req.params.testId);
    testData ? res.json(testData) : res.status(404).send("Test not found");
  }
);

// Reading Test Routes
app.get("/reading/:quizId", checkAuthenticated, (req, res) =>
  res.render("reading.ejs", { quizId: req.params.quizId })
);
app.get("/api/reading-quiz/:quizId", checkAuthenticated, async (req, res) => {
  const quizData = await loadData("reading", req.params.quizId);
  quizData ? res.json(quizData) : res.status(404).send("Quiz not found");
});

// Writing Task Routes
app.get("/writing/:taskId", checkAuthenticated, (req, res) =>
  res.render("writing.ejs", { taskId: req.params.taskId })
);
app.get("/api/writing-task/:taskId", checkAuthenticated, async (req, res) => {
  const taskData = await loadData("writing", req.params.taskId);
  taskData ? res.json(taskData) : res.status(404).send("Task not found");
});
app.post("/submit-writing", checkAuthenticated, async (req, res) => {
  try {
    const { task, response, wordCount } = req.body;
    await new WritingResponse({
      userId: req.user._id,
      task,
      response,
      wordCount,
    }).save();
    res
      .status(200)
      .json({ message: "Writing response submitted successfully." });
  } catch (error) {
    console.error("Error saving writing response:", error);
    res.status(500).json({ error: "Failed to save writing response." });
  }
});

// Login and Registration
app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/account/login",
    failureFlash: true,
  })
);
app.post("/register", checkNotAuthenticated, async (req, res) => {
  const { name, email, password, gender } = req.body;
  try {
    if (await User.findOne({ email })) {
      req.flash("error", "User with this email already exists.");
      return res.redirect("/register");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ name, email, password: hashedPassword, gender }).save();
    res.redirect("/account/login");
  } catch (err) {
    console.error("Error registering user:", err);
    req.flash("error", "Error during registration.");
    res.redirect("/register");
  }
});

// Quiz Submission
app.post("/submit-quiz", checkAuthenticated, async (req, res) => {
  try {
    await new QuizResponse(req.body).save();
    res.status(200).json({ message: "Quiz response submitted successfully." });
  } catch (error) {
    console.error("Error saving quiz response:", error);
    res.status(500).json({ error: "Failed to save quiz response." });
  }
});

// Logout
app.delete("/logout", (req, res, next) =>
  req.logOut((err) => (err ? next(err) : res.redirect("/")))
);

// Email Check
app.get("/check-email", async (req, res) => {
  try {
    res.json({ exists: !!(await User.findOne({ email: req.query.email })) });
  } catch (err) {
    console.error("Error checking email:", err);
    res.status(500).json({ error: "Error checking email" });
  }
});

// User Activity and History
app.get("/api/user-activity", checkAuthenticated, async (req, res) => {
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

app.get("/api/user-history", checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const quizzes = await QuizResponse.find({ userId });
    const lessons = await LessonCompletion.find({ userId });
    const writings = await WritingResponse.find({ userId });
    res.json({ quizzes, lessons, writings });
  } catch (err) {
    console.error("Error fetching user history:", err);
    res.status(500).json({ error: "Failed to fetch user history" });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Error fetching posts" });
  }
});

// API to create a new post
app.post("/api/posts", checkAuthenticated, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = new Post({
      title,
      content,
      author: req.user.name,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error adding post:", error);
    res.status(500).json({ error: "Error adding post" });
  }
});

// API to delete a post
app.delete("/api/posts/:id", checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the post by ID
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the logged-in user is the author
    if (post.author !== req.user.name) {
      return res.status(403).json({ error: "You are not authorized to delete this post" });
    }

    // Use deleteOne instead of remove
    await Post.deleteOne({ _id: id });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "An error occurred while deleting the post." });
  }
});



// API to update votes
app.put("/api/posts/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (action === "upvote") {
      post.votes += 1;
    } else if (action === "downvote") {
      post.votes -= 1;
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error("Error updating vote:", error);
    res.status(500).json({ error: "Error updating vote" });
  }
});

app.post("/api/posts/:id/replies", checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Add reply to the post's replies array
    const reply = {
      content,
      author: req.user.name,
      timestamp: new Date(),
    };
    post.replies.push(reply);
    await post.save();

    res.status(201).json(reply);
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ error: "Error adding reply." });
  }
});

app.delete("/api/posts/:postId/replies/:replyId", checkAuthenticated, async (req, res) => {
  try {
    const { postId, replyId } = req.params;

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Find the reply in the replies array
    const reply = post.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    // Check if the logged-in user is the author of the reply
    if (reply.author !== req.user.name) {
      return res.status(403).json({ error: "You are not authorized to delete this reply" });
    }

    // Remove the reply
    await Post.updateOne(
      { _id: postId },
      { $pull: { replies: { _id: replyId } } }
    );

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({ error: "An error occurred while deleting the reply." });
  }
});
// Start Server
app.listen(8000, () => console.log("Server running on http://localhost:8000"));