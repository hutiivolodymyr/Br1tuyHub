const pool = require("../db");

const getProfile = async (req, res) => {
    try {
        const user = await pool.query(
            `SELECT id, company_name, email, phone, address, role, is_blocked, created_at
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

const updateProfile = async (req, res) => {
    try {
        const { company_name, phone, address } = req.body;

        const updatedUser = await pool.query(
            `UPDATE users
             SET company_name = COALESCE($1, company_name),
                 phone = COALESCE($2, phone),
                 address = COALESCE($3, address)
             WHERE id = $4
             RETURNING id, company_name, email, phone, address, role, is_blocked, created_at`,
            [company_name, phone, address, req.user.id]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json({
            message: "Profile updated successfully",
            user: updatedUser.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
};
