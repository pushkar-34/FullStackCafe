const Menu = require("../models/MenuItem");
const Order = require("../models/Order");

exports.dashboard = async (req, res) => {
  const orders = await Order.find().populate("user");

  const salesMap = {};
  orders.forEach(o => {
    const day = new Date(o.createdAt).toLocaleDateString();
    salesMap[day] = (salesMap[day] || 0) + o.totalAmount;
  });

  res.render("admin/dashboard", {
    orders,
    labels: Object.keys(salesMap),
    data: Object.values(salesMap)
  });
};


exports.addMenu = async (req, res) => {
  await Menu.create(req.body);
  res.redirect("/admin/menu");
};

exports.toggleStock = async (req, res) => {
  const item = await Menu.findById(req.params.id);
  item.inStock = !item.inStock;
  await item.save();
  res.redirect("/admin/menu");
};
