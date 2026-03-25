const User = require("../models/User");
const Wallet = require("../models/Wallet");
const jwt = require("jsonwebtoken");

const generateToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  const user = await User.create(req.body);
  await Wallet.create({ user: user._id });
  res.cookie("token", generateToken(user._id));
  res.redirect("/dashboard");
};

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && await user.matchPassword(req.body.password)) {
    res.cookie("token", generateToken(user._id));
    res.redirect("/dashboard");
  } else {
    res.send("Invalid credentials");
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};
