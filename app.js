const express = require('express');
const path = require('path');
const app = express();

// Cấu hình để sử dụng file tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
