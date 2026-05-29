const pool = require("../db");
const { logAdminAction } = require("../services/auditService");

const validateProduct = ({
    category_id,
    name,
    description,
    price,
    unit,
    quantity_available,
}) => {
    if (!category_id) return "Category is required";
    if (!name || name.trim().length < 2) return "Product name is required";
    if (!description || description.trim().length < 3) return "Description is required";
    if (!unit) return "Unit is required";
    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
        return "Price must be greater than zero";
    }
    if (!Number.isFinite(Number(quantity_available)) || Number(quantity_available) < 0) {
        return "Quantity cannot be negative";
    }

    return null;
};

const createProduct = async (req, res) => {
    try {
        let {
            category_id,
            name,
            description,
            price,
            unit,
            quantity_available,
            image_url,
        } = req.body;

        const validationError = validateProduct({
            category_id,
            name,
            description,
            price,
            unit,
            quantity_available,
        });

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
        }

        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const supplier_id = req.user.id;

        const newProduct = await pool.query(
            `INSERT INTO products
            (
                supplier_id,
                category_id,
                name,
                description,
                price,
                unit,
                quantity_available,
                image_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                supplier_id,
                category_id,
                name.trim(),
                description.trim(),
                price,
                unit,
                quantity_available,
                image_url,
            ]
        );

        res.status(201).json({
            message: "Product created successfully",
            product: newProduct.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
        const offset = (page - 1) * limit;
        const search = req.query.search || "";
        const categoryId = req.query.category_id;

        const where = ["products.is_active = true"];
        const values = [];

        if (search) {
            values.push(`%${search}%`);
            where.push(`(products.name ILIKE $${values.length} OR products.description ILIKE $${values.length})`);
        }

        if (categoryId && categoryId !== "all") {
            values.push(categoryId);
            where.push(`products.category_id = $${values.length}`);
        }

        const whereSql = where.join(" AND ");
        const countValues = [...values];

        values.push(limit, offset);

        const products = await pool.query(
            `
            SELECT 
                products.*,
                categories.name AS category_name,
                users.company_name AS supplier_name
            FROM products
            LEFT JOIN categories 
                ON products.category_id = categories.id
            LEFT JOIN users 
                ON products.supplier_id = users.id
            WHERE ${whereSql}
            ORDER BY products.id DESC
            LIMIT $${values.length - 1}
            OFFSET $${values.length}
            `,
            values
        );

        const total = await pool.query(
            `SELECT COUNT(*) FROM products WHERE ${whereSql}`,
            countValues
        );

        res.json({
            products: products.rows,
            pagination: {
                page,
                limit,
                total: Number(total.rows[0].count),
                totalPages: Math.ceil(Number(total.rows[0].count) / limit),
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await pool.query(
            `
            SELECT 
                products.*,
                categories.name AS category_name,
                users.company_name AS supplier_name,
                users.phone AS supplier_phone,
                users.address AS supplier_address
            FROM products
            LEFT JOIN categories 
                ON products.category_id = categories.id
            LEFT JOIN users 
                ON products.supplier_id = users.id
            WHERE products.id = $1 AND products.is_active = true
            `,
            [id]
        );

        if (product.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.json({
            product: product.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        let {
            category_id,
            name,
            description,
            price,
            unit,
            quantity_available,
            image_url,
        } = req.body;

        const validationError = validateProduct({
            category_id,
            name,
            description,
            price,
            unit,
            quantity_available,
        });

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
        }

        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const productCheck = await pool.query(
            "SELECT * FROM products WHERE id = $1",
            [id]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        if (
            req.user.role !== "admin" &&
            productCheck.rows[0].supplier_id !== req.user.id
        ) {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        const updatedProduct = await pool.query(
            `UPDATE products
             SET category_id = $1,
                 name = $2,
                 description = $3,
                 price = $4,
                 unit = $5,
                 quantity_available = $6,
                 image_url = $7
             WHERE id = $8
             RETURNING *`,
            [
                category_id,
                name.trim(),
                description.trim(),
                price,
                unit,
                quantity_available,
                image_url,
                id,
            ]
        );

        if (req.user.role === "admin") {
            await logAdminAction({
                adminId: req.user.id,
                action: "update",
                entityType: "product",
                entityId: Number(id),
                details: updatedProduct.rows[0],
            });
        }

        res.json({
            message: "Product updated successfully",
            product: updatedProduct.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const productCheck = await pool.query(
            "SELECT * FROM products WHERE id = $1",
            [id]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        if (
            req.user.role !== "admin" &&
            productCheck.rows[0].supplier_id !== req.user.id
        ) {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        await pool.query(
            `
            UPDATE products
            SET is_active = false
            WHERE id = $1
            `,
            [id]
        );

        if (req.user.role === "admin") {
            await logAdminAction({
                adminId: req.user.id,
                action: "delete",
                entityType: "product",
                entityId: Number(id),
                details: productCheck.rows[0],
            });
        }

        res.json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};
