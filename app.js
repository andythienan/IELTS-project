const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/authRoute'); // Import auth routes

dotenv.config(); // Load biến môi trường từ file .env

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static(path.join(__dirname, 'view'))); // Serve static files

// Định tuyến
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'homepage.html'));
});
app.use('/auth', authRoutes); // Route cho authentication

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/ieltsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Kết nối MongoDB thất bại:'));
db.once('open', () => {
    console.log('Kết nối MongoDB thành công!');
});

// Lắng nghe server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
