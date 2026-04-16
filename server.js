require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const session = require("express-session");
const morgan = require("morgan");
const Menu = require("./models/Menu");
const Notification = require("./models/Notification");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set("io", io);

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

io.on("connection", (socket) => {
    socket.on("join", (userId) => {
        socket.join(userId);
    });
});

app.use(async (req, res, next) => {
    res.locals.user = req.session.userId || null;
    res.locals.role = req.session.role || null;
    res.locals.userName = req.session.userName || null;
    res.locals.userProfilePic = req.session.userProfilePic || null;
    res.locals.cart = req.session.cart || [];

    if (req.session.userId) {
        try {
            res.locals.notifications = await Notification.find({ userId: req.session.userId }).sort({ createdAt: -1 }).limit(5);
        } catch (err) {
            console.error("Notification Error:", err);
            res.locals.notifications = [];
        }
    } else {
        res.locals.notifications = [];
    }
    
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

        const category = (req.query.category && req.query.category.trim() !== '') ? req.query.category.trim() : 'all'; // Ensure category is trimmed
        const search = req.query.search ? req.query.search.trim() : '';
        const query = {};

        if (category.toLowerCase() !== 'all') { // Only add category filter if not 'all'
            query.category = { $regex: new RegExp(`^${category}$`, 'i') }; // Case-insensitive exact match for category
        }
        
        if (search !== '') {
            query.name = { $regex: search, $options: 'i' }; // Partial match for search
        }

        const totalProducts = await Menu.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
        const menu = await Menu.find(query).sort({ _id: -1 }).skip(skip).limit(limit);
        const allCategories = await Menu.distinct('category');
        
        console.log(`[DEBUG] Request for category: '${category}', search: '${search}', page: ${page}`);
        console.log(`[DEBUG] Mongoose query object:`, query);
        console.log(`[DEBUG] Items found for current query: ${menu.length} (Total matching in DB: ${totalProducts})`);

        if (menu.length === 0 && totalProducts === 0) {
            const totalItemsInDb = await Menu.countDocuments({});
            console.log(`[DEBUG] No items found for query. Total items in entire database (unfiltered): ${totalItemsInDb}`);
            if (totalItemsInDb === 0) {
                console.warn("[DEBUG] Database appears to be empty! Please add items via the admin panel.");
            }
        }
        console.log("[DEBUG] All distinct categories found:", allCategories);

        res.render("landing", {
            menu: menu || [], // Ensure menu is always an array
            allCategories: allCategories ? allCategories.filter(c => c && c.trim() !== '') : [], // Filter out null/empty categories
            currentCategory: category,
            currentSearch: search,
            currentPage: page,
            totalPages
        });
    } catch (err) {
        console.error("Error fetching menu:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/api/search-suggestions", async (req, res) => {
    try {
        const term = req.query.term;
        if (!term || term.length < 1) return res.json([]);

        const suggestions = await Menu.find({ 
            name: { $regex: term, $options: 'i' } 
        }).limit(5).select('name');

        res.json(suggestions.map(item => item.name));
    } catch (err) {
        res.status(500).json([]);
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
