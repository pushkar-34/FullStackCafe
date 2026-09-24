# 🍽️ FullStackCafe — Canteen & Food Ordering Management System

A full-stack web application designed to digitize canteen and food-ordering operations. The platform provides a smooth food browsing and ordering experience for students/customers and a dedicated management system for administrators.

🔗 **Live Demo:** https://fullstackcafe-1-5wmj.onrender.com/

---

## 📌 Overview

**FullStackCafe** is a full-stack canteen management and food-ordering application built using Node.js, Express.js, MongoDB and EJS.

The system allows customers/students to browse available food items, search the menu, manage their cart and place orders, while administrators can manage food items and monitor orders through an admin interface.

The project focuses on providing a simple, responsive and practical solution for managing day-to-day canteen operations.

---

## ✨ Features

### 👨‍🎓 Customer / Student

* 🔐 User Registration & Login
* 🍔 Browse available food items
* 🔎 Search food items
* 🗂️ Browse food by categories
* ➕ Add items to cart
* ➖ Increase/decrease item quantity
* 🛒 Manage shopping cart
* 📦 Place and manage orders
* 👤 User account management
* 📱 Responsive user interface

### 👨‍💼 Admin

* 🔐 Secure admin authentication
* 📊 Admin dashboard
* 🍔 Add food/menu items
* ✏️ Update food items
* 🗑️ Delete food items
* 📷 Upload food images
* 📦 Manage customer orders
* 🔄 Update order status
* 👥 Manage application data

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* EJS
* Responsive UI

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose
* MongoDB Atlas

### Authentication & Sessions

* Express Session
* Connect Mongo
* Password hashing

### Development Tools

* Git
* GitHub
* VS Code
* Render

---

## 🏗️ Project Architecture

```text
FullStackCafe/
│
├── config/
│   └── Database configuration
│
├── controllers/
│   ├── Authentication
│   ├── Menu
│   ├── Orders
│   └── User/Admin logic
│
├── middleware/
│   ├── Authentication
│   └── Authorization
│
├── models/
│   ├── User
│   ├── Menu
│   ├── Order
│   └── Other database models
│
├── routes/
│   ├── Authentication routes
│   ├── Menu routes
│   ├── Order routes
│   └── Admin routes
│
├── public/
│   ├── CSS
│   ├── JavaScript
│   └── Images/Uploads
│
├── views/
│   ├── User pages
│   ├── Admin pages
│   └── Shared components
│
├── app.js
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/pushkar-34/FullStackCafe.git
```

### 2. Navigate to the project

```bash
cd FullStackCafe
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory.

Example:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
```

Add any other environment variables required by your local configuration.

### 5. Start the application

```bash
npm start
```

For development:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## 🌐 Live Demo

The application is deployed on Render.

👉 **Live Application:**
https://fullstackcafe-1-5wmj.onrender.com/

---

## 🔐 Application Roles

The application is designed around role-based access.

### Student / Customer

Can:

* Register/Login
* Browse menu
* Search food
* Add items to cart
* Place orders
* Track orders

### Administrator

Can:

* Access admin dashboard
* Manage menu items
* Upload food images
* Manage orders
* Update order status
* Manage application data

---

## 📸 Screenshots

Screenshots of the major application pages can be added here.

### Home / Menu

*Add screenshot here*

### Food Details

*Add screenshot here*

### Cart

*Add screenshot here*

### Student Dashboard

*Add screenshot here*

### Admin Dashboard

*Add screenshot here*

---

## 🔒 Security

The application includes server-side authentication and authorization mechanisms to protect user and administrative functionality.

Sensitive configuration such as database credentials and session secrets should be stored using environment variables and should not be committed to the repository.

---

## 🚀 Deployment

The application is deployed using **Render**.

The production application connects to a cloud-hosted MongoDB database through MongoDB Atlas.

---

## 🎯 Use Cases

This system can be adapted for:

* 🏫 College canteens
* 🎓 University food courts
* 🏢 Office cafeterias
* 🏨 Hostel mess/canteens
* 🍴 Small cafes
* 🍱 Food ordering systems

---

## 🔮 Future Enhancements

Possible future improvements include:

* 💳 Online payment integration
* 📧 Email order notifications
* 📱 WhatsApp order notifications
* 📊 Advanced admin analytics
* 🔔 Real-time order notifications
* ⭐ Food ratings and reviews
* 🎟️ Coupon/discount system
* 💰 Wallet and transaction history
* 📈 Sales and revenue reports
* 📱 Progressive Web App support

---

## 👨‍💻 Developer

**Pushkar Sheoran**

Full Stack Web Developer

### Technologies

`JavaScript` · `Node.js` · `Express.js` · `MongoDB` · `EJS` · `HTML` · `CSS`

---

## 📄 License

This project is created for learning, portfolio and demonstration purposes.
