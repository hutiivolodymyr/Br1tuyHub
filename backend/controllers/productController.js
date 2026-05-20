const pool = require("../db");

const createProduct = async (req, res) => {
    try {
        const {
            category_id,
            name,
            description,
            price,
            unit,
            quantity_available,
            image_url,
        } = req.body;

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
                name,
                description,
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
        const products = await pool.query(`
            SELECT 
                products.*,
                categories.name AS category_name,
                users.company_name AS supplier_name
            FROM products
            LEFT JOIN categories 
                ON products.category_id = categories.id
            LEFT JOIN users 
                ON products.supplier_id = users.id
            WHERE products.is_active = true
            ORDER BY products.id DESC
        `);

        res.json({
            products: products.rows,
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

        const {
            category_id,
            name,
            description,
            price,
            unit,
            quantity_available,
            image_url,
        } = req.body;

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
                name,
                description,
                price,
                unit,
                quantity_available,
                image_url,
                id,
            ]
        );

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
    deleteProduct
};