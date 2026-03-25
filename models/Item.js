const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: {
    type: String,
    enum: ["Breakfast", "Lunch", "Snacks", "Drinks"]
  },
  type: { type: String, enum: ["veg", "non-veg"] },
  inStock: { type: Boolean, default: true }
});

module.exports = mongoose.model("Item", itemSchema);
