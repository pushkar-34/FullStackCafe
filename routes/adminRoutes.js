const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const uploadDir = path.join(__dirname, '../public/uploads/products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });


router.use((req, res, next) => {
    if (req.session.userId && req.session.role === 'admin') {
        next();
    } else {
        res.redirect('/login');
    }
});

router.get('/', async (req, res) => {
    const orderCount = await Order.countDocuments();
    const userCount = await User.countDocuments();
    const productCount = await Menu.countDocuments();
    
    res.render('admin/dashboard', { 
        orderCount, userCount, productCount,
        userName: req.session.userName || null, 
        userProfilePic: req.session.userProfilePic || null 
    });
});

router.get('/orders', async (req, res) => {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.render('admin/orders', { orders, userName: req.session.userName || null, userProfilePic: req.session.userProfilePic || null });
});

router.get('/users', async (req, res) => {
    const users = await User.find();
    res.render('admin/users', { users, userName: req.session.userName || null, userProfilePic: req.session.userProfilePic || null });
});

router.get('/products', async (req, res) => {
    const menu = await Menu.find().sort({ createdAt: -1 });
    res.render('admin/products', { menu, userName: req.session.userName || null, userProfilePic: req.session.userProfilePic || null });
});

router.post('/order/status', async (req, res) => {
    const { orderId, status } = req.body;
    try {
        await Order.findByIdAndUpdate(orderId, { status });
    } catch (err) {
        console.error(err);
    }
    res.redirect('/admin/orders');
});

router.post('/menu/add', upload.single('image'), async (req, res) => {
    const { name, price, description, category } = req.body;
    const image = req.file ? '/uploads/products/' + req.file.filename : undefined;
    try {
        await Menu.create({ name, price, description, image, category });
    } catch (err) {
        console.error(err);
    }
    res.redirect('/admin/products');
});

router.post('/product/toggle-stock', async (req, res) => {
    const { itemId } = req.body;
    try {
        const item = await Menu.findById(itemId);
        if (item) {
            item.inStock = !item.inStock;
            await item.save();
        }
    } catch (err) {
        console.error(err);
    }
    res.redirect('/admin/products');
});

router.post('/user/toggle-status', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (user) {
            user.isActive = !user.isActive;
            await user.save();
        }
    } catch (err) {
        console.error(err);
    }
    res.redirect('/admin/users');
});

module.exports = router;