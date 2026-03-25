const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  user: String,
  foodId: String,
  foodName: String
});

module.exports = mongoose.model("Favorite", favoriteSchema);
