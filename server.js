// server.js
if (process.env.NODE_ENV !== "production") require("dotenv").config();

const express = require("express");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");
// Database
const connectDB = require("./config/db");

// Passport configuration
const initializePassport = require("./config/passport-config");

// Routes
const publicRoutes = require("./routes/public");
const accountRoutes = require("./routes/account");
const authRoutes = require("./routes/auth");
const libraryRoutes = require("./routes/library");
const lessonRoutes = require("./routes/lesson");
const listeningRoutes = require("./routes/listening");
const readingRoutes = require("./routes/reading");
const writingRoutes = require("./routes/writing");
const profileRoutes = require("./routes/profile");
const forumRoutes = require("./routes/forum");
const apiRoutes = require("./routes/api");

// Models
const User = require("./models/User");

const app = express();

// Database connection
connectDB();

// Middleware
app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
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

// Routes
app.use("/", publicRoutes);
app.use("/account", accountRoutes);
app.use("/", authRoutes); // Authentication-related routes (login, register)
app.use("/library", libraryRoutes);
app.use("/lesson", lessonRoutes);
app.use("/listening", listeningRoutes);
app.use("/reading", readingRoutes);
app.use("/writing", writingRoutes);
app.use("/profile", profileRoutes);
app.use("/forum", forumRoutes);
app.use("/api", apiRoutes);

// Start Server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));