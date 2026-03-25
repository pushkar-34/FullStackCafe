const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

router.post('/add', async (req, res) => {
    const { itemId, quantity } = req.body;
    const qty = parseInt(quantity, 10) || 1;

    if (req.session.userId) {
        let cart = await Cart.findOne({ userId: req.session.userId });
        if (!cart) {
            cart = new Cart({ userId: req.session.userId, items: [] });
        }
        const existingItemIndex = cart.items.findIndex(item => item.itemId.toString() === itemId);
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += qty;
        } else {
            cart.items.push({ itemId, quantity: qty });
        }
        await cart.save();
    } else {
        if (!req.session.cart) {
            req.session.cart = [];
        }
        const existingItemIndex = req.session.cart.findIndex(item => item.itemId === itemId);
        if (existingItemIndex > -1) {
            req.session.cart[existingItemIndex].quantity += qty;
        } else {
            req.session.cart.push({ itemId, quantity: qty });
        }
        return req.session.save(() => {
            res.redirect('/');
        });
    }

    res.redirect('/');
});

router.get('/', async (req, res) => {
    let sessionCart = [];
    
    if (req.session.userId) {
        const cart = await Cart.findOne({ userId: req.session.userId });
        if (cart) sessionCart = cart.items;
    } else {
        sessionCart = req.session.cart || [];
    }

    let cartItems = [];
    let total = 0;

    if (sessionCart.length > 0) {
        const itemIds = sessionCart.map(item => item.itemId);
        const menuItems = await Menu.find({ _id: { $in: itemIds } });

        cartItems = sessionCart.map(cartItem => {
            const menuItem = menuItems.find(m => m._id.toString() === cartItem.itemId.toString());
            if (menuItem) {
                const itemTotal = menuItem.price * cartItem.quantity;
                total += itemTotal;
                return {
                    ...menuItem.toObject(),
                    quantity: cartItem.quantity,
                    itemTotal
                };
            }
            return null;
        }).filter(item => item !== null);
    }

    res.render('cart', { cartItems, total, user: req.session.userId, role: req.session.role || null, userName: req.session.userName || null, userProfilePic: req.session.userProfilePic || null });
});

router.post('/update', async (req, res) => {
    const { itemId, action } = req.body;
    
    if (req.session.userId) {
        let cart = await Cart.findOne({ userId: req.session.userId });
        if (cart) {
            const itemIndex = cart.items.findIndex(item => item.itemId.toString() === itemId);
            if (itemIndex > -1) {
                if (action === 'increase') {
                    cart.items[itemIndex].quantity += 1;
                } else if (action === 'decrease') {
                    cart.items[itemIndex].quantity -= 1;
                    if (cart.items[itemIndex].quantity <= 0) {
                        cart.items.splice(itemIndex, 1);
                    }
                }
                await cart.save();
            }
        }
    } else {
        if (req.session.cart) {
            const itemIndex = req.session.cart.findIndex(item => item.itemId === itemId);
            if (itemIndex > -1) {
                if (action === 'increase') {
                    req.session.cart[itemIndex].quantity += 1;
                } else if (action === 'decrease') {
                    req.session.cart[itemIndex].quantity -= 1;
                    if (req.session.cart[itemIndex].quantity <= 0) {
                        req.session.cart.splice(itemIndex, 1);
                    }
                }
            }
            return req.session.save(() => {
                res.redirect('/cart');
            });
        }
    }
    res.redirect('/cart');
});

router.post('/remove', async (req, res) => {
    const { itemId } = req.body;
    
    if (req.session.userId) {
        let cart = await Cart.findOne({ userId: req.session.userId });
        if (cart) {
            cart.items = cart.items.filter(item => item.itemId.toString() !== itemId);
            await cart.save();
        }
    } else {
        if (req.session.cart) {
            req.session.cart = req.session.cart.filter(item => item.itemId !== itemId);
            return req.session.save(() => {
                res.redirect('/cart');
            });
        }
    }
    res.redirect('/cart');
});

router.post('/checkout', async (req, res) => {
    if (!req.session.userId) {
        req.session.returnTo = '/cart';
        return res.redirect('/login');
    }

    if (req.session.role === 'admin') {
        return res.redirect('/admin');
    }

    try {
        let sessionCart = [];
        const cart = await Cart.findOne({ userId: req.session.userId });
        if (cart) {
            sessionCart = cart.items;
        }

        if (sessionCart.length === 0) {
            return res.redirect('/cart');
        }

        const itemIds = sessionCart.map(item => item.itemId);
        const menuItems = await Menu.find({ _id: { $in: itemIds } });
        
        let orderItems = [];
        let total = 0;

        sessionCart.forEach(cartItem => {
            const menuItem = menuItems.find(m => m._id.toString() === cartItem.itemId.toString());
            if (menuItem) {
                orderItems.push({ 
                    menuItem: menuItem._id, 
                    name: menuItem.name, 
                    price: menuItem.price,
                    quantity: cartItem.quantity
                });
                total += menuItem.price * cartItem.quantity;
            }
        });

        await Order.create({ user: req.session.userId, items: orderItems, total });
        
       
        await Cart.findOneAndDelete({ userId: req.session.userId });
        req.session.cart = []; 
        req.session.save(() => {
            res.redirect('/student/dashboard');
        });
    } catch (err) {
        console.error(err);
        res.redirect('/cart');
    }
});

module.exports = router;