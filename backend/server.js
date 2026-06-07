require("dotenv").config();
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const app = express();
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const path = require("path");
const bcrypt = require("bcrypt");

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
}));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/", (req, res) => {
    res.send("Br1tuyHub API працює");
});

const PORT = process.env.PORT || 5000;

const ensureSchema = async () => {
    await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS region VARCHAR(120)
    `);

    await pool.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS delivery_phone VARCHAR(50),
        ADD COLUMN IF NOT EXISTS delivery_address TEXT,
        ADD COLUMN IF NOT EXISTS delivery_comment TEXT
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            action VARCHAR(80) NOT NULL,
            entity_type VARCHAR(80) NOT NULL,
            entity_id INTEGER,
            details JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        DELETE FROM categories a
        USING categories b
        WHERE a.id > b.id
          AND a.name = b.name
    `);

    await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS categories_name_unique
        ON categories (name)
    `);

    await pool.query(`
        INSERT INTO categories (name)
        VALUES ('Фрукти'), ('Овочі'), ('Молочні продукти'), ('М''ясо'), ('Напої'), ('Бакалія')
        ON CONFLICT DO NOTHING
    `);
};

const ensureAdminAccount = async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
        `INSERT INTO users
        (company_name, email, password, phone, address, role)
        VALUES ($1, $2, $3, $4, $5, 'admin')
        ON CONFLICT (email)
        DO UPDATE SET
            company_name = EXCLUDED.company_name,
            password = EXCLUDED.password,
            role = 'admin'`,
        [
            process.env.ADMIN_COMPANY_NAME || "Br1tuyHub Admin",
            email,
            hashedPassword,
            "",
            "",
        ]
    );
};

app.listen(PORT, async () => {
    try {
        await pool.query("SELECT NOW()");
        await ensureSchema();
        await ensureAdminAccount();
        console.log("PostgreSQL connected");
        console.log(`Server started on port ${PORT}`);
    } catch (error) {
        console.error(error);
    }
});
