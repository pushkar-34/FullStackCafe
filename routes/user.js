const express = require("express");
const Food = require("../models/Food");
const Cart = require("./models/Cart");

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  if (!req.session.user) return res.redirect("/auth/login");

  const foods = await Food.find();
  res.render("dashboard", { foods });
});

router.get("/add-cart/:id", async (req, res) => {
  await Cart.create({
    userId: req.session.user._id,
    foodId: req.params.id
  });

  res.redirect("/user/dashboard");
});

router.get("/cart", async (req, res) => {
  const items = await Cart.find({ userId: req.session.user._id })
    .populate("foodId");

  res.render("cart", { items });
});

module.exports = router;
