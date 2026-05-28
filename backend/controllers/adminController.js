const pool = require("../db");

const getAdminPanel = async (req, res) => {
    res.json({
        message: "Admin panel route works",
        user: req.user,
    });
};

const getAllUsers = async (req, res) => {
    try {
        const users = await pool.query(
            `SELECT id, company_name, email, phone, address, role, is_blocked, created_at
             FROM users
             ORDER BY id DESC`
        );

        res.json({
            users: users.rows,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (Number(id) === req.user.id) {
            return res.status(400).json({
                message: "Admin cannot delete own account",
            });
        }

        const user = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        await pool.query(
            "DELETE FROM users WHERE id = $1",
            [id]
        );

        res.json({
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const blockUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (Number(id) === req.user.id) {
            return res.status(400).json({
                message: "Admin cannot block own account",
            });
        }

        const user = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const updatedUser = await pool.query(
            `UPDATE users
             SET is_blocked = true
             WHERE id = $1
             RETURNING id, company_name, email, role, is_blocked`,
            [id]
        );

        res.json({
            message: "User blocked successfully",
            user: updatedUser.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const unblockUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const updatedUser = await pool.query(
            `UPDATE users
             SET is_blocked = false
             WHERE id = $1
             RETURNING id, company_name, email, role, is_blocked`,
            [id]
        );

        res.json({
            message: "User unblocked successfully",
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
    getAdminPanel,
    getAllUsers,
    deleteUser,
    blockUser,
    unblockUser,
};