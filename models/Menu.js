const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    image: String,
    category: String,
    inStock: { type: Boolean, default: true }
});

module.exports = mongoose.model('Menu', menuSchema);