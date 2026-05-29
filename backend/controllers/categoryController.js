const pool = require("../db");
const { logAdminAction } = require("../services/auditService");

const getCategories = async (req, res) => {
    try {
        const categories = await pool.query(
            "SELECT * FROM categories ORDER BY name ASC"
        );

        res.json({
            categories: categories.rows,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                message: "Category name is required",
            });
        }

        const category = await pool.query(
            `INSERT INTO categories (name)
             VALUES ($1)
             RETURNING *`,
            [name.trim()]
        );

        await logAdminAction({
            adminId: req.user.id,
            action: "create",
            entityType: "category",
            entityId: category.rows[0].id,
            details: category.rows[0],
        });

        res.status(201).json({
            message: "Category created successfully",
            category: category.rows[0],
        });
    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(400).json({
                message: "Category already exists",
            });
        }

        res.status(500).json({
            message: "Server error",
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                message: "Category name is required",
            });
        }

        const category = await pool.query(
            `UPDATE categories
             SET name = $1
             WHERE id = $2
             RETURNING *`,
            [name.trim(), id]
        );

        if (category.rows.length === 0) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        await logAdminAction({
            adminId: req.user.id,
            action: "update",
            entityType: "category",
            entityId: Number(id),
            details: category.rows[0],
        });

        res.json({
            message: "Category updated successfully",
            category: category.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const products = await pool.query(
            "SELECT id FROM products WHERE category_id = $1 LIMIT 1",
            [id]
        );

        if (products.rows.length > 0) {
            return res.status(400).json({
                message: "Category has products",
            });
        }

        const category = await pool.query(
            "DELETE FROM categories WHERE id = $1 RETURNING *",
            [id]
        );

        if (category.rows.length === 0) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        await logAdminAction({
            adminId: req.user.id,
            action: "delete",
            entityType: "category",
            entityId: Number(id),
            details: category.rows[0],
        });

        res.json({
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
