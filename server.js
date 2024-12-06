if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const fs = require("fs");
const path = require("path");
const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

// Load user data from file
const USERS_FILE = path.join(__dirname, "data", "users.json");
let users = [];

// Ensure 'data' folder exists
if (!fs.existsSync(path.dirname(USERS_FILE))) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
}

// Load users from JSON file
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

const app = express();

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

app.get("/", (req, res) => {
  const name = req.user ? req.user.name : null; // Extract name if the user is authenticated
  res.render("index.ejs", { name });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", { messages: req.flash() }); // Pass flash messages to the template
});


app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true, // Enable failure flash messages
  })
);


app.use((req, res, next) => {
  res.locals.user = req.isAuthenticated() ? req.user : null;
  next();
});


app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = users.find((user) => user.email === req.body.email);
    if (existingUser) {
      req.flash("error", "A user with this email address already exists.");
      return res.redirect("/register");
    }

    // If email is unique, proceed with registration
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = {
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      gender: req.body.gender, // Include gender
    };
    users.push(newUser);

    // Save updated users to file
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.redirect("/login");
  } catch (error) {
    console.error("Error during registration:", error);
    req.flash(
      "error",
      "An error occurred while registering. Please try again."
    );
    res.redirect("/register");
  }
});


app.get("/check-email", (req, res) => {
  const email = req.query.email;
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.json({ exists: true });
  }
  res.json({ exists: false });
});

app.get("/api/users", (req, res) => {
  const dataPath = path.join(__dirname, "data/users.json");

  fs.readFile(dataPath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).send({ message: "Error reading users file." });
    }

    const users = JSON.parse(data);
    res.send(users);
  });
});

app.get("/exam-library", (req, res) => {
  const name = req.user ? req.user.name : null; // Extract name if the user is authenticated
  res.render("exam-library.ejs", { name });
});

app.get("/lesson-library", (req, res) => {
  const name = req.user ? req.user.name : null; // Extract name if the user is authenticated
  res.render("lessons-library.ejs", { name });
});


  app.get("/forum", (req, res) => {
    const name = req.user ? req.user.name : null; // Extract name if the user is authenticated
    res.render("forum.ejs", { name });
  });
  

  app.get("/skills", (req, res) => {
    const name = req.user ? req.user.name : null; // Extract name if the user is authenticated
    res.render("skill.ejs", { name });
  });
  
  app.get("/tips", (req, res) => {
    const name = req.user ? req.user.name : null; // Extract name if the user is authenticated
    res.render("tips.ejs", { name });
  });
  

  app.get("/vocabulary", (req, res) => {
    const name = req.user ? req.user.name : null; // Extract name if the user is authenticated
    res.render("vocab.ejs", { name });
  });
  

  app.get("/about-us", (req, res) => {
    const name = req.user ? req.user.name : null; // Extract name if the user is authenticated
    res.render("about-us.ejs", { name });
  });
  

app.delete("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function checkAuthenticated(req, res, next) {
  console.log("Authenticated User:", req.user); // Debugging line
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

app.listen(3000, () => console.log("Server started on http://localhost:3000"));
