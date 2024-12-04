const express = require('express');
const morgan = require('morgan')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const handlebars = require('express-handlebars');
const path = require('path');
const app = express();
const port = 3000;

//Template engine
app.engine('html', handlebars.engine({
    extname: '.html',    // cấu hình Handlebars để nhận diện file .html
}));

app.set('view engine', 'html'); 
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
//Render
app.get('/', (req, res) => {
    res.render('homepage');
  });
  
  app.get('/about-us', (req, res) => {
    res.render('about-us');
  });
  
  app.get('/exam-library', (req, res) => {
    res.render('exam-library');
  });


//Lắng nghe server
app.listen(port, () => {
    console.log(`Server đang lắng nghe tại http://localhost:${port}`);
  });