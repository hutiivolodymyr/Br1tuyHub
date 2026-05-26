const pool = require("../db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const createOrder = async (req, res) => {
    try {
        const business_id = req.user.id;
        const { supplier_id, items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "Order items are required",
            });
        }

        let total_price = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await pool.query(
                "SELECT * FROM products WHERE id = $1 AND is_active = true",
                [item.product_id]
            );

            if (product.rows.length === 0) {
                return res.status(404).json({
                    message: `Product with id ${item.product_id} not found`,
                });
            }
if (product.rows[0].quantity_available < item.quantity) {
    return res.status(400).json({
        message: `Not enough quantity for product ${item.product_id}`,
    });
}
            const price = Number(product.rows[0].price);
            const subtotal = price * item.quantity;

            total_price += subtotal;

            orderItemsData.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price,
                subtotal,
            });
        }

        const newOrder = await pool.query(
            `INSERT INTO orders
            (business_id, supplier_id, total_price)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [business_id, supplier_id, total_price]
        );

        const order_id = newOrder.rows[0].id;

for (const item of orderItemsData) {
    await pool.query(
        `INSERT INTO order_items
        (order_id, product_id, quantity, price, subtotal)
        VALUES ($1, $2, $3, $4, $5)`,
        [
            order_id,
            item.product_id,
            item.quantity,
            item.price,
            item.subtotal,
        ]
    );

    await pool.query(
        `UPDATE products
         SET quantity_available = quantity_available - $1
         WHERE id = $2`,
        [item.quantity, item.product_id]
    );
}


        res.status(201).json({
            message: "Order created successfully",
            order: newOrder.rows[0],
            items: orderItemsData,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        let orders;

        if (req.user.role === "business") {
            orders = await pool.query(
                `
                SELECT *
                FROM orders
                WHERE business_id = $1
                ORDER BY id DESC
                `,
                [req.user.id]
            );

        } else if (req.user.role === "supplier") {
            orders = await pool.query(
                `
                SELECT *
                FROM orders
                WHERE supplier_id = $1
                ORDER BY id DESC
                `,
                [req.user.id]
            );

        } else {
            return res.status(403).json({
                message: "Access denied",
            });
        }

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

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "new",
            "confirmed",
            "delivered",
            "cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }

        const orderCheck = await pool.query(
            "SELECT * FROM orders WHERE id = $1",
            [id]
        );

        if (orderCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        const order = orderCheck.rows[0];

        if (
            req.user.role === "supplier" &&
            order.supplier_id !== req.user.id
        ) {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        if (
            req.user.role === "business" &&
            order.business_id !== req.user.id
        ) {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        if (
            req.user.role === "business" &&
            status !== "cancelled"
        ) {
            return res.status(403).json({
                message: "Business can only cancel order",
            });
        }

        let pdf_url = order.pdf_url;

if (status === "confirmed") {

    const pdfName = `order_${id}.pdf`;
    const pdfPath = path.join(__dirname, "..", "pdfs", pdfName);

    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(22).text("Br1tuyHub Invoice", {
        align: "center",
    });

    doc.moveDown();

    doc.fontSize(14).text(`Order ID: ${id}`);
    doc.text(`Supplier ID: ${order.supplier_id}`);
    doc.text(`Business ID: ${order.business_id}`);
    doc.text(`Total price: ${order.total_price} UAH`);
    doc.text(`Status: confirmed`);

    doc.moveDown();

    doc.text("Thank you for using Br1tuyHub!");

    doc.end();

    pdf_url = `/pdfs/${pdfName}`;
}

const updatedOrder = await pool.query(
    `
    UPDATE orders
    SET status = $1,
        pdf_url = $2
    WHERE id = $3
    RETURNING *
    `,
    [status, pdf_url, id]
);

        res.json({
            message: "Order status updated successfully",
            order: updatedOrder.rows[0],
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};
const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await pool.query(
            `SELECT *
             FROM orders
             WHERE id = $1`,
            [id]
        );

        if (order.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        const items = await pool.query(
            `SELECT 
                order_items.id,
                order_items.quantity,
                order_items.price,
                order_items.subtotal,
                products.name,
                products.unit,
                products.image_url
             FROM order_items
             JOIN products ON order_items.product_id = products.id
             WHERE order_items.order_id = $1`,
            [id]
        );

        res.json({
            order: order.rows[0],
            items: items.rows,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};
module.exports = {
    createOrder,
    getMyOrders,
    updateOrderStatus,
    getOrderDetails,
};