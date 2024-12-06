const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Declare routes
app.get('/', (req, res) => {
  res.render('pages/homepage');
});
app.get('/about', (req, res) => {
  res.render('pages/about');  
});

// Chạy server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
