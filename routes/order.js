const express = require("express");
const Order = require("../models/Order");
const router = express.Router();
const Cart = require("4./models/Cart");
router.get("/cart", (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  res.render("cart", { cart: req.session.cart });
});

router.post("/add-to-cart/:id", async (req, res) => {
  const food = await Food.findById(req.params.id);

  const existing = await Cart.findOne({
    user: req.session.user.username,
    foodId: food._id
  });

  if (existing) {
    existing.quantity += 1;
    await existing.save();
  } else {
    await Cart.create({
      user: req.session.user.username,
      foodId: food._id,
      foodName: food.name,
      price: food.price
    });
  }

  res.redirect("/dashboard");
});


router.post("/place-order", async (req, res) => {
  const cartItems = await Cart.find({ user: req.session.user.username });

  for (let item of cartItems) {
    await Order.create({
      user: req.session.user.username,
      foodName: item.foodName,
      price: item.price * item.quantity
    });
  }

  await Cart.deleteMany({ user: req.session.user.username });

  res.redirect("/orders");
});


router.get("/orders", async (req, res) => {
  const orders = await Order.find({ user: req.session.user._id });
  res.render("orders", { orders });
});

module.exports = router;
