if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}


const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const User = require("./models/User"); // User model
const bodyParser = require('body-parser');
const WritingResponse = require("./models/WritingResponse");
const QuizResponse = require("./models/QuizResponse");
const LessonCompletion = require('./models/LessonCompletion');



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



// MongoDB connection URI (Make sure this is in your .env file and correctly formatted)
const uri = "mongodb+srv://Mikeblocky:iamawizardty%3AD%21@learnenglish.tnwoh.mongodb.net/?retryWrites=true&w=majority&appName=learnEnglish";

// **Removed MongoClient setup. Mongoose will handle the connection.**

// Connect to MongoDB using Mongoose
mongoose.connect(uri, { dbName: 'myDatabase' }) // Specify database here
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// **No need for db.on or db.once. The above .then and .catch handle success and errors.**

const app = express();

// Passport configuration
const initializePassport = require("./passport-config");
initializePassport(
  passport,
  async (email) => {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null; // Return null on error to indicate user not found
    }
  },
  async (id) => {
    try {
      const user = await User.findById(id);
      return user;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null; // Return null on error to indicate user not found
    }
  }
);

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.locals.user = req.user || null; // Simplified user assignment
  next();
});

// Routes
app.get("/", (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render("index.ejs", { name });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", { messages: req.flash() });
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      req.flash("error", "A user with this email address already exists.");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      gender: req.body.gender,
    });

    await newUser.save();
    res.redirect("/login");
  } catch (error) {
    console.error("Error during registration:", error);
    req.flash("error", "An error occurred while registering. Please try again.");
    res.redirect("/register");
  }
});
app.get('/check-email', async (req, res) => {
  try {
      const email = req.query.email;
      const user = await User.findOne({ email });

      if (user) {
          res.json({ exists: true });
      } else {
          res.json({ exists: false });
      }
  } catch (error) {
      console.error('Error checking email:', error);
      res.status(500).json({ error: 'Error checking email' });
  }
});


app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error); // Log the error
    res.status(500).send({ message: "Error fetching users." });
  }
});

app.get("/exam-library", (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render("exam-library.ejs", { name });
});

app.get("/reading1", (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render("reading1.ejs", { name });
});

app.get("/reading2", (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render("reading2.ejs", { name });
});

app.get("/reading3", (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render("reading3.ejs", { name });
});

app.get("/listening", (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render("listening 1.ejs", { name });
});

// User Profile Route
app.get("/profile", (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render("profile.ejs", { name });
});

// User Profile Route
app.get("/about-us", (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render("about-us.ejs", { name });
});

app.get("/vocabulary", (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render("vocab.ejs", { name });
});

app.get("/skills", (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render("skill.ejs", { name });
});

app.get("/tips", (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render("tips.ejs", { name });
});

app.get("/lesson-library", (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render("lessons-library.ejs", { name });
});

app.get("/forum", (req, res) => {
  const name = req.user ? req.user.name : null; // Pass logged-in user's name
  res.render("forum.ejs", { name });
});

app.get("/writing1", (req, res) => {
  const name = req.user ? req.user.name : null; // Pass logged-in user's name
  res.render("writing1.ejs", { name });
});

app.get("/writing2", (req, res) => {
  const name = req.user ? req.user.name : null; // Pass logged-in user's name
  res.render("writing2.ejs", { name });
});

app.get("/writing3", (req, res) => {
  const name = req.user ? req.user.name : null; // Pass logged-in user's name
  res.render("writing3.ejs", { name });
});

app.get("/lesson1", (req, res) => {
  const name = req.user ? req.user.name : null; // Pass logged-in user's name
  res.render("lesson1.ejs", { name });
});

app.get("/lesson2", (req, res) => {
  const name = req.user ? req.user.name : null; // Pass logged-in user's name
  res.render("lesson2.ejs", { name });
});

app.get("/lesson4", (req, res) => {
  const name = req.user ? req.user.name : null; // Pass logged-in user's name
  res.render("lesson4.ejs", { name });
});

app.get('/history', checkAuthenticated, (req, res) => {
  const name = req.user ? req.user.name : null;
  res.render('history.ejs', { name });
});

app.post('/api/complete-lesson', checkAuthenticated, async (req, res) => {
  try {
      const { lessonId } = req.body;
      const userId = req.user._id;

      // Check if the user has already completed the lesson
      const existingRecord = await LessonCompletion.findOne({ userId, lessonId });

      if (!existingRecord) {
          // Save the lesson completion record
          const lessonCompletion = new LessonCompletion({
              userId,
              lessonId,
              completedAt: new Date(),
          });
          await lessonCompletion.save();
      }

      res.status(200).json({ message: 'Lesson completion recorded successfully.' });
  } catch (error) {
      console.error('Error recording lesson completion:', error);
      res.status(500).json({ error: 'Failed to record lesson completion.' });
  }
});


app.delete("/logout", (req, res, next) => { // Add 'next' parameter
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Middleware
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.use(bodyParser.json());

app.post("/submit-quiz", checkAuthenticated, async (req, res) => {
  try {
    const { quizId, questions, score, percentage, highlights, notes } = req.body;

    // Construct the quiz response object
    const quizResponse = new QuizResponse({
      userId: req.user._id, // Ensure the user is authenticated and their ID is attached
      quizId,
      questions,
      score,
      percentage,
      highlights,
      notes,
    });

    // Save to MongoDB
    await quizResponse.save();

    console.log("Quiz response saved:", quizResponse);
    res.status(200).json({ message: "Quiz response submitted successfully.", data: quizResponse });
  } catch (error) {
    console.error("Error saving quiz response:", error);
    res.status(500).json({ error: "Failed to save quiz response." });
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

app.post("/submit-writing", checkAuthenticated, async (req, res) => {
  try {
    const { task, response, wordCount } = req.body;

    // Create a new WritingResponse document
    const writingResponse = new WritingResponse({
      userId: req.user._id, // Store the ID of the logged-in user
      task,
      response,
      wordCount,
    });

    // Save the response to the database
    await writingResponse.save();

    console.log("Writing response saved:", writingResponse);
    res.status(200).send("Writing test submitted successfully.");
  } catch (error) {
    console.error("Error saving writing response:", error);
    res.status(500).send("Failed to submit writing test.");
  }
});

app.get('/api/user-activity', checkAuthenticated, async (req, res) => {
  try {
      const userId = req.user._id;

      // Fetch completed quizzes
      const completedQuizzes = await QuizResponse.countDocuments({ userId });

      // Fetch completed lessons
      const completedLessons = await LessonCompletion.countDocuments({ userId });

      // Fetch completed writings
      const completedWritings = await WritingResponse.countDocuments({ userId });

      res.json({
          completedQuizzes,
          completedLessons,
          completedWritings,
      });
  } catch (error) {
      console.error('Error fetching user activity:', error);
      res.status(500).json({ error: 'Failed to fetch user activity.' });
  }
});

app.get('/api/user-history', checkAuthenticated, async (req, res) => {
  try {
      const userId = req.user._id;

      // Fetch completed quizzes
      const completedQuizzes = await QuizResponse.find({ userId });

      // Fetch completed lessons
      const completedLessons = await LessonCompletion.find({ userId });

      // Fetch completed writings
      const completedWritings = await WritingResponse.find({ userId });

      res.json({
          quizzes: completedQuizzes,
          lessons: completedLessons,
          writings: completedWritings,
      });
  } catch (error) {
      console.error('Error fetching user history:', error);
      res.status(500).json({ error: 'Failed to fetch user history.' });
  }
});


app.listen(3000, () => console.log("Server started on http://localhost:3000"));