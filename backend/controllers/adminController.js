const pool = require("../db");
const { logAdminAction } = require("../services/auditService");

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

const getAllOrders = async (req, res) => {
    try {
        const orders = await pool.query(
            `SELECT 
                orders.*,
                business.company_name AS business_name,
                business.email AS business_email,
                supplier.company_name AS supplier_name,
                supplier.email AS supplier_email
             FROM orders
             LEFT JOIN users business ON orders.business_id = business.id
             LEFT JOIN users supplier ON orders.supplier_id = supplier.id
             ORDER BY orders.id DESC`
        );

        res.json({
            orders: orders.rows,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await pool.query(
            `SELECT 
                products.*,
                categories.name AS category_name,
                users.company_name AS supplier_name
             FROM products
             LEFT JOIN categories ON products.category_id = categories.id
             LEFT JOIN users ON products.supplier_id = users.id
             ORDER BY products.id DESC`
        );

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

const getAuditLogs = async (req, res) => {
    try {
        const logs = await pool.query(
            `SELECT audit_logs.*, users.email AS admin_email
             FROM audit_logs
             LEFT JOIN users ON audit_logs.admin_id = users.id
             ORDER BY audit_logs.id DESC
             LIMIT 100`
        );

        res.json({
            logs: logs.rows,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const deleteOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query("BEGIN");

        const order = await client.query(
            "SELECT * FROM orders WHERE id = $1 FOR UPDATE",
            [id]
        );

        if (order.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Order not found",
            });
        }

        const items = await client.query(
            "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
            [id]
        );

        if (order.rows[0].status !== "cancelled") {
            for (const item of items.rows) {
                await client.query(
                    `UPDATE products
                     SET quantity_available = quantity_available + $1
                     WHERE id = $2`,
                    [item.quantity, item.product_id]
                );
            }
        }

        await client.query("DELETE FROM order_items WHERE order_id = $1", [id]);
        await client.query("DELETE FROM orders WHERE id = $1", [id]);
        await client.query("COMMIT");

        await logAdminAction({
            adminId: req.user.id,
            action: "delete",
            entityType: "order",
            entityId: Number(id),
            details: order.rows[0],
        });

        res.json({
            message: "Order deleted successfully",
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    } finally {
        client.release();
    }
};

const restoreOrdersStock = async (client, orderIds) => {
    for (const orderId of orderIds) {
        const order = await client.query(
            "SELECT status FROM orders WHERE id = $1",
            [orderId]
        );

        if (order.rows[0]?.status === "cancelled") {
            continue;
        }

        const items = await client.query(
            "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
            [orderId]
        );

        for (const item of items.rows) {
            await client.query(
                `UPDATE products
                 SET quantity_available = quantity_available + $1
                 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }
    }
};

const deleteUser = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        if (Number(id) === req.user.id) {
            return res.status(400).json({
                message: "Admin cannot delete own account",
            });
        }

        await client.query("BEGIN");

        const user = await client.query(
            "SELECT * FROM users WHERE id = $1",
            [id]
        );

        if (user.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "User not found",
            });
        }

        const relatedOrders = await client.query(
            "SELECT id FROM orders WHERE business_id = $1 OR supplier_id = $1",
            [id]
        );

        const orderIds = relatedOrders.rows.map((order) => order.id);
        await restoreOrdersStock(client, orderIds);

        for (const orderId of orderIds) {
            await client.query("DELETE FROM order_items WHERE order_id = $1", [orderId]);
        }

        await client.query(
            "DELETE FROM orders WHERE business_id = $1 OR supplier_id = $1",
            [id]
        );

        await client.query(
            "DELETE FROM products WHERE supplier_id = $1",
            [id]
        );

        await client.query(
            "DELETE FROM users WHERE id = $1",
            [id]
        );

        await client.query("COMMIT");

        await logAdminAction({
            adminId: req.user.id,
            action: "delete",
            entityType: "user",
            entityId: Number(id),
            details: user.rows[0],
        });

        res.json({
            message: "User deleted successfully",
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    } finally {
        client.release();
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

        await logAdminAction({
            adminId: req.user.id,
            action: "block",
            entityType: "user",
            entityId: Number(id),
            details: updatedUser.rows[0],
        });

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

        await logAdminAction({
            adminId: req.user.id,
            action: "unblock",
            entityType: "user",
            entityId: Number(id),
            details: updatedUser.rows[0],
        });

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
    getAllOrders,
    getAllProducts,
    getAuditLogs,
    deleteUser,
    deleteOrder,
    blockUser,
    unblockUser,
};
