const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, username, password, role } = req.body;

        // 1. Check if user already exists
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: "User already exists" });

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create and save user
        user = new User({
            firstName,
            lastName,
            username: username.toLowerCase(),
            password/*: hashedPassword*/,
            role
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find User
        const user = await User.findOne({ username: username.toLowerCase() });
        console.log(user);
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // 2. Check Password
        const isMatch = password == user.password //await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // 3. Create Token (This is the user's "ID Badge")
        const token = jwt.sign(
            { id: user._id, role: user.role==='seller' ? 1 : 0 }, // Include role in token payload 1: seller, 0: buyer
            process.env.JWT_SECRET || 'secretkey', 
            { expiresIn: '1h' }
        );

        // 4. Send back the token AND the role
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role // The frontend will use this to redirect
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};