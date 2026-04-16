const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const User = require('../models/User');
const Notification = require('../models/Notification');
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
    try {
        const [orderCount, userCount, productCount, pendingOrders] = await Promise.all([
            Order.countDocuments(),
            User.countDocuments(),
            Menu.countDocuments(),
            Order.find({ status: 'Pending' })
        ]);

        const pendingOrderCount = pendingOrders.length;
        const kitchenView = {};
        
        pendingOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.name) {
                    kitchenView[item.name] = (kitchenView[item.name] || 0) + item.quantity;
                }
            });
        });

        res.render('admin/dashboard', { 
            orderCount, userCount, productCount, pendingOrderCount,
            kitchenView,
            userName: req.session.userName || null, 
            userProfilePic: req.session.userProfilePic || null 
        });
    } catch (err) {
        console.error("Admin Dashboard Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/kitchen', async (req, res) => {
    try {
        const pendingOrders = await Order.find({ status: 'Pending' })
            .populate('user', 'name email')
            .sort({ createdAt: 1 });

        const kitchenView = {};
        pendingOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.name) {
                    kitchenView[item.name] = (kitchenView[item.name] || 0) + item.quantity;
                }
            });
        });

        res.render('admin/kitchen', { 
            pendingOrders, 
            kitchenView,
            userName: req.session.userName || null, 
            userProfilePic: req.session.userProfilePic || null 
        });
    } catch (err) {
        console.error("Error in Kitchen Dashboard:", err);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.render('admin/orders', { orders, userName: req.session.userName || null, userProfilePic: req.session.userProfilePic || null });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching orders");
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.render('admin/users', { users, userName: req.session.userName || null, userProfilePic: req.session.userProfilePic || null });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching users");
    }
});

router.get('/products', async (req, res) => {
    try {
        const menu = await Menu.find().sort({ createdAt: -1 });
        res.render('admin/products', { menu, userName: req.session.userName || null, userProfilePic: req.session.userProfilePic || null });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching products");
    }
});

router.post('/order/status', async (req, res) => {
    const { orderId, status } = req.body;
    try {
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        
        if (order) {
            const msg = status === 'Completed' 
                ? `Your order is ready! Please collect it from the counter.` 
                : `Your order status has been updated to: ${status}`;

            await Notification.create({
                userId: order.user,
                message: msg
            });

            const io = req.app.get('io');
            io.to(order.user.toString()).emit('orderUpdate', {
                message: msg,
                status: status
            });
        }
    } catch (err) {
        console.error(err);
    }
    res.redirect(req.header('Referer') || '/admin/orders');
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