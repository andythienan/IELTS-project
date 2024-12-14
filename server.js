// ==============================
// Environment Configuration
// ==============================
if (process.env.NODE_ENV !== "production") require("dotenv").config();

// ==============================
// Module Imports
// ==============================
const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Models
const User = require("./models/User");
const WritingResponse = require("./models/WritingResponse");
const ListeningResponse = require("./models/ListeningResponse");
const QuizResponse = require("./models/QuizResponse");
const LessonCompletion = require("./models/LessonCompletion");

// Passport configuration
const initializePassport = require("./passport-config");

// Post configuration
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

// ==============================
// Database Connection
// ==============================
const DB_URI = "mongodb+srv://Mikeblocky:iamawizardty%3AD%21@learnenglish.tnwoh.mongodb.net/?retryWrites=true&w=majority&appName=learnEnglish";
mongoose
  .connect(DB_URI, { dbName: "myDatabase" })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ==============================
// App Initialization
// ==============================
const app = express();
app.set("view-engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(flash());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
initializePassport(
  passport,
  async (email) => await User.findOne({ email }).catch(() => null),
  async (id) => await User.findById(id).catch(() => null)
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware for global user context
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// ==============================
// Middleware: Authentication
// ==============================
const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};

const checkNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect("/");
  next();
};

// ==============================
// Route Handlers
// ==============================
const renderPage = (page) => (req, res) =>
  res.render(`${page}.ejs`, { name: req.user?.name || null });

// Public Routes
app.get("/", renderPage("index"));
app.get("/login", checkNotAuthenticated, renderPage("login"));
app.get("/register", checkNotAuthenticated, renderPage("register"));
app.get("/about-us", renderPage("about-us"));
app.get("/vocabulary", renderPage("vocab"));
app.get("/skills", renderPage("skill"));
app.get("/tips", renderPage("tips"));


// Authenticated Routes
// On home
app.get("/profile", checkAuthenticated, renderPage("profile"));
app.get("/exam-library", checkAuthenticated, renderPage("exam-library"));
app.get("/lesson-library", checkAuthenticated, renderPage("lessons-library"));
app.get("/history", checkAuthenticated, renderPage("history"));
app.get("/forum", checkAuthenticated, renderPage("forum"));
// Tests

// Listening
app.get("/listening1", checkAuthenticated, renderPage("listening1"));
app.get("/listening2", checkAuthenticated, renderPage("listening2"));
app.get("/listening3", checkAuthenticated, renderPage("listening3"));

// Reading
app.get("/reading1", checkAuthenticated, renderPage("reading1"));
app.get("/reading2", checkAuthenticated, renderPage("reading2"));
app.get("/reading3", checkAuthenticated, renderPage("reading3"));

// Writing
app.get("/writing1", checkAuthenticated, renderPage("writing1"));
app.get("/writing2", checkAuthenticated, renderPage("writing2"));
app.get("/writing3", checkAuthenticated, renderPage("writing3"));

// Lessons
app.get("/lesson1", checkAuthenticated, renderPage("lesson1"));
app.get("/lesson2", checkAuthenticated, renderPage("lesson2"));
app.get("/lesson4", checkAuthenticated, renderPage("lesson4"));

// Login and Registration
app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/register", checkNotAuthenticated, async (req, res) => {
  const { name, email, password, gender } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "A user with this email already exists.");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, gender });
    await newUser.save();

    res.redirect("/login");
  } catch (err) {
    console.error("Error registering user:", err);
    req.flash("error", "An error occurred during registration.");
    res.redirect("/register");
  }
});

app.post("/submit-quiz", checkAuthenticated, async (req, res) => {
  try {
    const { userId, quizId, questions, score, percentage } = req.body;

    const quizResponse = new QuizResponse({
      userId,
      quizId,
      questions,
      score,
      percentage,
    });

    await quizResponse.save();
    res.status(200).json({ message: "Quiz response submitted successfully." });
  } catch (error) {
    console.error("Error saving quiz response:", error);
    res.status(500).json({ error: "Failed to save quiz response." });
  }
});


// Logout
app.delete("/logout", (req, res, next) => {
  req.logOut((err) => (err ? next(err) : res.redirect("/")));
});

// Email Check
app.get("/check-email", async (req, res) => {
  try {
    const emailExists = !!(await User.findOne({ email: req.query.email }));
    res.json({ exists: emailExists });
  } catch (err) {
    console.error("Error checking email:", err);
    res.status(500).json({ error: "Error checking email" });
  }
});

// ==============================
// API Endpoints
// ==============================

// User History
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

// Posts & Replies
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Error fetching posts" });
  }
});

app.post("/api/posts", checkAuthenticated, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = new Post({ title, content, author: req.user.name });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error adding post:", err);
    res.status(500).json({ error: "Error adding post" });
  }
});

// Voting System
app.put("/api/posts/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const post = await Post.findById(id);

    if (!post) return res.status(404).json({ error: "Post not found" });
    post.votes += action === "upvote" ? 1 : action === "downvote" ? -1 : 0;
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    console.error("Error updating vote:", err);
    res.status(500).json({ error: "Error updating vote" });
  }
});

// ==============================
// Server Startup
// ==============================
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
