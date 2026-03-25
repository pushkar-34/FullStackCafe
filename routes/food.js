const express = require("express");
const Food = require("../models/Food");
const router = express.Router();

router.get("/menu", async (req, res) => {
  const foods = await Food.find();
  res.render("index", { foods });
});

module.exports = router;
