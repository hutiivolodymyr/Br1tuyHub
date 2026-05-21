const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const app = express();
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const path = require("path");


app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
    res.send("Br1tuyHub API працює");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    try {
        await pool.query("SELECT NOW()");
        console.log("PostgreSQL connected");
        console.log(`Server started on port ${PORT}`);
    } catch (error) {
        console.error(error);
    }
});