const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { company_name, email, password, phone, address, region, role } = req.body;

        const allowedRoles = ["business", "supplier"];

        if (!company_name || company_name.trim().length < 2) {
            return res.status(400).json({
                message: "Company name is required",
            });
        }

        if (!email || !email.includes("@")) {
            return res.status(400).json({
                message: "Valid email is required",
            });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters",
            });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role",
            });
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO users
            (company_name, email, password, phone, address, region, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, company_name, email, phone, address, region, role, is_blocked, created_at`,
            [company_name, email, hashedPassword, phone, address, region || "", role]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: newUser.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        if (user.rows[0].is_blocked) {
            return res.status(403).json({
                message: "User is blocked",
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if (!validPassword) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            {
                id: user.rows[0].id,
                role: user.rows[0].role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.rows[0].id,
                company_name: user.rows[0].company_name,
                email: user.rows[0].email,
                phone: user.rows[0].phone,
                address: user.rows[0].address,
                region: user.rows[0].region,
                role: user.rows[0].role,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await pool.query(
            `SELECT id, company_name, email, phone, address, region, role, is_blocked, created_at
             FROM users
             WHERE id = $1`,
            [req.user.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json({
            user: user.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
};
