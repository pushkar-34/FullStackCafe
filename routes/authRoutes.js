const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Cart = require('../models/Cart');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pushkarsheoran277@gmail.com',
        pass: 'gjpd gaop udmv zpaw'
    }
});


const uploadDir = path.join(__dirname, '../public/uploads/profiles');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

router.get('/login', (req, res) => {
    res.render('login', { 
        error: null,
        user: req.session.userId || null,
        role: req.session.role || null,
        userName: req.session.userName || null,
        userProfilePic: req.session.userProfilePic || null
    });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        if (user.isActive === false) {
            return res.render('login', { error: 'Your account has been deactivated. Please contact admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password' });
        }
        req.session.userId = user._id;
        req.session.role = user.role;
        req.session.userName = user.name;
        req.session.userProfilePic = user.profilePic;

        if (req.session.cart && req.session.cart.length > 0) {
            let userCart = await Cart.findOne({ userId: user._id });
            if (!userCart) {
                userCart = new Cart({ userId: user._id, items: [] });
            }
            
            req.session.cart.forEach(sessionItem => {
                const existingItem = userCart.items.find(item => item.itemId.toString() === sessionItem.itemId);
                if (existingItem) {
                    existingItem.quantity += sessionItem.quantity;
                } else {
                    userCart.items.push(sessionItem);
                }
            });
            
            await userCart.save();
            req.session.cart = [];
        }

        req.session.save(() => {
            const returnTo = req.session.returnTo;
            delete req.session.returnTo;
            if (user.role === 'admin') {
                res.redirect('/admin');
            } else {
                res.redirect(returnTo || '/');
            }
        });
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'An error occurred during login' });
    }
});
   

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

router.get('/register', (req, res) => res.render('register', { 
    error: null,
    user: req.session.userId || null,
    role: req.session.role || null,
    userName: req.session.userName || null,
    userProfilePic: req.session.userProfilePic || null
}));

router.post('/register', upload.single('profilePic'), async (req, res) => {
    const { name, email, password } = req.body;
    const profilePic = req.file ? '/uploads/profiles/' + req.file.filename : undefined;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { error: 'Email already exists' });
        }
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);
        
        req.session.tempUser = { name, email, password: hashedPassword, profilePic, otp };

        const mailOptions = {
            from: 'pushkarsheoran277@gmail.com',
            to: email,
            subject: 'Canteen Café - Verify Your Account',
            html: `<h3>Welcome to Canteen Café!</h3><p>Your OTP for registration is: <strong>${otp}</strong></p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Mail Error:", error);
                return res.render('register', { error: 'Failed to send OTP. Please try again.' });
            }
            res.redirect('/verify-otp');
        });
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Error registering user' });
    }
});

router.get('/verify-otp', (req, res) => {
    if (!req.session.tempUser) return res.redirect('/register');
    res.render('verify-otp', { error: null });
});

router.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;
    const tempUser = req.session.tempUser;

    if (!tempUser) return res.redirect('/register');

    if (otp === tempUser.otp) {
        try {
            await User.create({ 
                name: tempUser.name, 
                email: tempUser.email, 
                password: tempUser.password, 
                role: 'student', 
                profilePic: tempUser.profilePic 
            });
            delete req.session.tempUser;
            res.redirect('/login');
        } catch (err) {
            console.error(err);
            res.render('verify-otp', { error: 'Error creating user' });
        }
    } else {
        res.render('verify-otp', { error: 'Invalid OTP code' });
    }
});

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { error: null });
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('forgot-password', { error: 'No account found with that email address.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        req.session.resetEmail = email;
        req.session.resetOtp = otp;

        const mailOptions = {
            from: 'pushkarsheoran277@gmail.com',
            to: email,
            subject: 'Canteen Café - Password Reset OTP',
            html: `<h3>Password Reset Request</h3>
                   <p>You requested a password reset. Your verification code is: <strong>${otp}</strong></p>
                   <p>If you did not request this, please ignore this email.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Mail Error:", error);
                return res.render('forgot-password', { error: 'Failed to send reset code. Try again.' });
            }
            res.redirect('/reset-password');
        });
    } catch (err) {
        res.render('forgot-password', { error: 'An error occurred. Please try again.' });
    }
});

router.get('/reset-password', (req, res) => {
    if (!req.session.resetEmail) return res.redirect('/forgot-password');
    res.render('reset-password', { error: null });
});

router.post('/reset-password', async (req, res) => {
    const { otp, newPassword } = req.body;
    if (otp === req.session.resetOtp) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email: req.session.resetEmail }, { password: hashedPassword });
        delete req.session.resetOtp;
        delete req.session.resetEmail;
        res.redirect('/login');
    } else {
        res.render('reset-password', { error: 'Invalid OTP code' });
    }
});

module.exports = router;