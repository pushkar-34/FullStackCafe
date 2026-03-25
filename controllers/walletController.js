const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

exports.viewWallet = async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user._id });
  const transactions = await Transaction.find({ user: req.user._id });
  res.render("student/wallet", { wallet, transactions });
};

exports.addMoney = async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user._id });
  wallet.balance += Number(req.body.amount);
  await wallet.save();

  await Transaction.create({
    user: req.user._id,
    amount: req.body.amount,
    type: "credit"
  });

  res.redirect("/wallet");
};
