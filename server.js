require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const morgan = require("morgan");
const Menu = require("./models/Menu");

const app = express();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/canteen")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(session({
    secret: process.env.SESSION_SECRET || "canteen_secret",
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.user = req.session.userId || null;
    res.locals.role = req.session.role || null;
    res.locals.userName = req.session.userName || null;
    res.locals.userProfilePic = req.session.userProfilePic || null;
    res.locals.cart = req.session.cart || [];
    next();
});

app.use("/", require("./routes/authRoutes"));
app.use("/student", require("./routes/studentRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/cart", require("./routes/cartRoutes"));

app.get("/", async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        if (page < 1) page = 1;
        const limit = 4; 
        const skip = (page - 1) * limit;

        const category = req.query.category;
        const query = {};
        if (category && category !== 'all') {
            query.category = category;
        }

        const totalProducts = await Menu.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        const menu = await Menu.find(query).sort({ _id: -1 }).skip(skip).limit(limit);
        const allCategories = await Menu.distinct('category');

        res.render("landing", {
            menu,
            currentPage: page,
            totalPages: totalPages,
            allCategories,
            currentCategory: category || 'all'
        });
    } catch (err) {
        console.error("Error fetching menu:", err);
        res.status(500).send("Internal Server Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
