const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendOtpEmail = require('../utils/sendOtpEmail');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        user = new User({
            name,
            email,
            passwordHash,
            otp,
            otpExpiry
        });

        await user.save();
        
        // Disable OTP email for dev if EMAIL_USER is empty
        if(process.env.EMAIL_USER) {
            await sendOtpEmail(email, otp);
        } else {
            console.log(`[DEV] OTP for ${email}: ${otp}`);
        }

        res.status(201).json({ message: 'Registration successful. Please verify OTP sent to your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'OTP verified successfully',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        if(process.env.EMAIL_USER) {
            await sendOtpEmail(email, otp);
        } else {
            console.log(`[DEV] New OTP for ${email}: ${otp}`);
        }

        res.status(200).json({ message: 'New OTP sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email via OTP first' });
        }

        if (user.isBanned) {
            return res.status(403).json({ message: 'Your account has been suspended.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Must be admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Not an Admin' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.isBanned) {
            return res.status(403).json({ message: 'Your account has been suspended.' });
        }

        // Admin does not strictly need email verification constraint, but we can check if needed.
        // Assuming admin can login instantly without OTP check if they have admin role.
        
        // 30 minutes expiration
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30m' });

        res.status(200).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
