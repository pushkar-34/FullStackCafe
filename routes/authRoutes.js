const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Cart = require('../models/Cart');


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
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashedPassword, role: 'student', profilePic });
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Error registering user' });
    }
});


module.exports = router;