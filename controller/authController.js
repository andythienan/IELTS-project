const User = require('../model/userModel'); // Model người dùng
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Đăng ký
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash mật khẩu
        const newUser = await User.create({ username, email, password: hashedPassword });
        res.status(201).json({ message: 'Đăng ký thành công!', user: newUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại!' });

        const isMatch = await bcrypt.compare(password, user.password); // So sánh mật khẩu
        if (!isMatch) return res.status(401).json({ message: 'Sai mật khẩu!' });

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
        res.status(200).json({ message: 'Đăng nhập thành công!', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
