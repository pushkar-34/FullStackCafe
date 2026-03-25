const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  type: { type: String, enum: ["veg", "non-veg"] },
  inStock: { type: Boolean, default: true }
});

module.exports = mongoose.model("MenuItem", menuSchema);
