const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

router.get('/dashboard', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    
    const user = await User.findById(req.session.userId);
    const orders = await Order.find({ user: req.session.userId }).sort({ createdAt: -1 });
    res.render('student/dashboard', { orders, user, userProfilePic: req.session.userProfilePic || null });
});

module.exports = router;