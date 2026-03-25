const Menu = require("../models/MenuItem");
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

exports.dashboard = async (req, res) => {
  const menu = await Menu.find({ inStock: true });
  res.render("student/dashboard", { menu, user: req.user });
};

exports.placeOrder = async (req, res) => {
  const items = JSON.parse(req.body.items);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const wallet = await Wallet.findOne({ user: req.user._id });
  if (wallet.balance < total) return res.send("Low Balance");

  wallet.balance -= total;
  await wallet.save();

  await Transaction.create({
    user: req.user._id,
    amount: total,
    type: "debit"
  });

  await Order.create({
    user: req.user._id,
    items,
    totalAmount: total,
    pickupTime: req.body.pickupTime
  });

  res.redirect("/orders");
};
