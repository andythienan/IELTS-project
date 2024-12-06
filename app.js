var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Simulated user credentials for login validation
const validUser = {
  email: "john@example.com",
  password: "password123"
};

// Route: Login Page
app.get('/login', (req, res) => {
  res.render('login', { messages: { error: null } });
});

// Route: Handle Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === validUser.email && password === validUser.password) {
    // Redirect to logged-in page
    res.redirect('/logged-in');
  } else {
    // Redirect back to login with error message
    res.render('login', { messages: { error: 'Invalid email or password.' } });
  }
});

// Route: Logged In
app.get('/logged-in', (req, res) => {
  // Load and parse users.json
  const usersFilePath = path.join(__dirname, 'data', 'users.json');
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading users.json:", err);
      res.status(500).send("Error loading user data.");
      return;
    }

    // Parse JSON data and pass to the EJS template
    const users = JSON.parse(data);
    res.render('loggedIn', { users });
  });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
