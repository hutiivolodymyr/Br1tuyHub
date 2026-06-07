const pool = require("../db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { logAdminAction } = require("../services/auditService");

const canAccessOrder = (user, order) => {
    return (
        user.role === "admin" ||
        order.business_id === user.id ||
        order.supplier_id === user.id
    );
};

const statusTransitions = {
    new: ["confirmed", "cancelled"],
    confirmed: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
};

const statusLabels = {
    new: "Нове",
    confirmed: "Підтверджене",
    delivered: "Доставлене",
    cancelled: "Скасоване",
};

const formatOrderNumber = (orderId) => `BH-${String(orderId).padStart(6, "0")}`;

const formatMoney = (value) => Number(value || 0).toFixed(2);

const calculateOrderTotal = (items) =>
    items.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.price),
        0
    );

const getPdfFontPath = () => {
    const fontPaths = [
        "C:\\Windows\\Fonts\\arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/Library/Fonts/Arial.ttf",
    ];

    return fontPaths.find((fontPath) => fs.existsSync(fontPath));
};

const generateOrderPdf = async (orderId) => {
    const orderResult = await pool.query(
        `SELECT 
            orders.*,
            business.company_name AS business_name,
            business.email AS business_email,
            business.phone AS business_phone,
            supplier.company_name AS supplier_name,
            supplier.email AS supplier_email,
            supplier.phone AS supplier_phone
         FROM orders
         LEFT JOIN users business ON orders.business_id = business.id
         LEFT JOIN users supplier ON orders.supplier_id = supplier.id
         WHERE orders.id = $1`,
        [orderId]
    );

    const itemsResult = await pool.query(
        `SELECT 
            order_items.quantity,
            order_items.price,
            order_items.subtotal,
            products.name,
            products.unit
         FROM order_items
         JOIN products ON order_items.product_id = products.id
         WHERE order_items.order_id = $1`,
        [orderId]
    );

    const order = orderResult.rows[0];
    const calculatedTotal = calculateOrderTotal(itemsResult.rows);

    if (Number(order.total_price) !== calculatedTotal) {
        await pool.query(
            `UPDATE orders
             SET total_price = $1
             WHERE id = $2`,
            [calculatedTotal, order.id]
        );

        order.total_price = calculatedTotal;
    }

    order.total_price = formatMoney(calculatedTotal);

    const pdfDir = path.join(__dirname, "..", "pdfs");
    fs.mkdirSync(pdfDir, { recursive: true });

    const orderNumber = formatOrderNumber(order.id);
    const pdfName = `invoice_${orderNumber}.pdf`;
    const pdfPath = path.join(pdfDir, pdfName);
    const doc = new PDFDocument({ margin: 48 });
    const fontPath = getPdfFontPath();

    if (fontPath) {
        doc.registerFont("AppFont", fontPath);
        doc.font("AppFont");
    }

    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(22).text("Рахунок Br1tuyHub", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Номер рахунку: ${orderNumber}`);
    doc.text(`Дата оформлення: ${new Date(order.created_at).toLocaleDateString("uk-UA")}`);
    doc.text(`Статус замовлення: ${statusLabels[order.status] || order.status}`);
    doc.moveDown();
    doc.fontSize(14).text("Покупець");
    doc.fontSize(11).text(`${order.business_name || "-"} (${order.business_email || "-"})`);
    doc.text(`Телефон: ${order.business_phone || order.delivery_phone || "-"}`);
    doc.moveDown();
    doc.fontSize(14).text("Постачальник");
    doc.fontSize(11).text(`${order.supplier_name || "-"} (${order.supplier_email || "-"})`);
    doc.text(`Телефон: ${order.supplier_phone || "-"}`);
    doc.moveDown();
    doc.fontSize(14).text("Доставка");
    doc.fontSize(11).text(`Телефон для доставки: ${order.delivery_phone || "-"}`);
    doc.text(`Адреса: ${order.delivery_address || "-"}`);
    if (order.delivery_comment) doc.text(`Коментар: ${order.delivery_comment}`);
    doc.moveDown();
    doc.fontSize(14).text("Товари");
    doc.moveDown(0.5);

    itemsResult.rows.forEach((item, index) => {
        item.subtotal = formatMoney(Number(item.quantity) * Number(item.price));
        item.price = formatMoney(item.price);

        doc.fontSize(11).text(
            `${index + 1}. ${item.name} - ${item.quantity} ${item.unit} x ${item.price} грн = ${item.subtotal} грн`
        );
    });

    doc.moveDown();
    doc.fontSize(16).text(`До сплати: ${order.total_price} грн`, { align: "right" });
    doc.end();

    return `/pdfs/${pdfName}`;
};

const createOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        const business_id = req.user.id;
        const {
            supplier_id,
            items,
            delivery_phone,
            delivery_address,
            delivery_comment,
        } = req.body;

        if (!supplier_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Supplier and order items are required",
            });
        }

        await client.query("BEGIN");

        let total_price = 0;
        const orderItemsData = [];

        for (const item of items) {
            const quantity = Number(item.quantity);

            if (!Number.isFinite(quantity) || quantity <= 0) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: "Product quantity must be greater than zero",
                });
            }

            const product = await client.query(
                `SELECT *
                 FROM products
                 WHERE id = $1 AND is_active = true
                 FOR UPDATE`,
                [item.product_id]
            );

            if (product.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(404).json({
                    message: `Product with id ${item.product_id} not found`,
                });
            }

            const productRow = product.rows[0];

            if (productRow.supplier_id !== Number(supplier_id)) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: "All products must belong to the selected supplier",
                });
            }

            if (Number(productRow.quantity_available) < quantity) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: `Not enough quantity for product ${item.product_id}`,
                });
            }

            const price = Number(productRow.price);
            const subtotal = price * quantity;

            total_price += subtotal;

            orderItemsData.push({
                product_id: item.product_id,
                quantity,
                price,
                subtotal,
            });
        }

        const userProfile = await client.query(
            `SELECT phone, address
             FROM users
             WHERE id = $1`,
            [business_id]
        );

        const deliveryPhone = delivery_phone || userProfile.rows[0]?.phone || "";
        const deliveryAddress = delivery_address || userProfile.rows[0]?.address || "";

        const newOrder = await client.query(
            `INSERT INTO orders
            (business_id, supplier_id, total_price, delivery_phone, delivery_address, delivery_comment)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                business_id,
                supplier_id,
                total_price,
                deliveryPhone,
                deliveryAddress,
                delivery_comment || "",
            ]
        );

        const order_id = newOrder.rows[0].id;

        for (const item of orderItemsData) {
            await client.query(
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

            await client.query(
                `UPDATE products
                 SET quantity_available = quantity_available - $1
                 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            message: "Order created successfully",
            order: newOrder.rows[0],
            items: orderItemsData,
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

const getMyOrders = async (req, res) => {
    try {
        let orders;
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
        const offset = (page - 1) * limit;
        const status = req.query.status;

        if (req.user.role === "business") {
            orders = await pool.query(
                `
                SELECT *
                FROM orders
                WHERE business_id = $1
                  AND ($2::text IS NULL OR status = $2)
                ORDER BY id DESC
                LIMIT $3 OFFSET $4
                `,
                [req.user.id, status || null, limit, offset]
            );
        } else if (req.user.role === "supplier") {
            orders = await pool.query(
                `
                SELECT *
                FROM orders
                WHERE supplier_id = $1
                  AND ($2::text IS NULL OR status = $2)
                ORDER BY id DESC
                LIMIT $3 OFFSET $4
                `,
                [req.user.id, status || null, limit, offset]
            );
        } else if (req.user.role === "admin") {
            orders = await pool.query(
                `
                SELECT *
                FROM orders
                WHERE ($1::text IS NULL OR status = $1)
                ORDER BY id DESC
                LIMIT $2 OFFSET $3
                `,
                [status || null, limit, offset]
            );
        } else {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        res.json({
            orders: orders.rows,
            pagination: {
                page,
                limit,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const restoreOrderStock = async (client, orderId) => {
    const items = await client.query(
        `SELECT product_id, quantity
         FROM order_items
         WHERE order_id = $1`,
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
};

const updateOrderStatus = async (req, res) => {
    const client = await pool.connect();

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

        await client.query("BEGIN");

        const orderCheck = await client.query(
            "SELECT * FROM orders WHERE id = $1 FOR UPDATE",
            [id]
        );

        if (orderCheck.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Order not found",
            });
        }

        const order = orderCheck.rows[0];

        if (!canAccessOrder(req.user, order)) {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "Access denied",
            });
        }

        if (req.user.role === "business" && status !== "cancelled") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "Business can only cancel order",
            });
        }

        if (order.status === "cancelled" && status !== "cancelled") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Cancelled order cannot be changed",
            });
        }

        if (!statusTransitions[order.status]?.includes(status) && status !== order.status) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Invalid status transition",
            });
        }

        let pdf_url = order.pdf_url;

        if (status === "cancelled" && order.status !== "cancelled") {
            await restoreOrderStock(client, id);
        }

        if (status === "confirmed") {
            pdf_url = await generateOrderPdf(id);
        }

        const updatedOrder = await client.query(
            `
            UPDATE orders
            SET status = $1,
                pdf_url = $2
            WHERE id = $3
            RETURNING *
            `,
            [status, pdf_url, id]
        );

        await client.query("COMMIT");

        if (req.user.role === "admin") {
            await logAdminAction({
                adminId: req.user.id,
                action: "status_change",
                entityType: "order",
                entityId: Number(id),
                details: {
                    from: order.status,
                    to: status,
                },
            });
        }

        res.json({
            message: "Order status updated successfully",
            order: updatedOrder.rows[0],
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

const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await pool.query(
            `SELECT 
                orders.*,
                business.company_name AS business_name,
                business.email AS business_email,
                business.phone AS business_phone,
                supplier.company_name AS supplier_name,
                supplier.email AS supplier_email,
                supplier.phone AS supplier_phone
             FROM orders
             LEFT JOIN users business ON orders.business_id = business.id
             LEFT JOIN users supplier ON orders.supplier_id = supplier.id
             WHERE orders.id = $1`,
            [id]
        );

        if (order.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        let orderRow = order.rows[0];

        if (!canAccessOrder(req.user, orderRow)) {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        if (
            ["confirmed", "delivered"].includes(orderRow.status) &&
            (!orderRow.pdf_url || orderRow.pdf_url.includes(`order_${id}.pdf`))
        ) {
            const pdfUrl = await generateOrderPdf(id);
            const updatedOrder = await pool.query(
                `UPDATE orders
                 SET pdf_url = $1
                 WHERE id = $2
                 RETURNING *`,
                [pdfUrl, id]
            );

            orderRow = {
                ...orderRow,
                ...updatedOrder.rows[0],
            };
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

        const detailsTotal = calculateOrderTotal(items.rows);

        if (
            ["confirmed", "delivered"].includes(orderRow.status) &&
            Number(orderRow.total_price) !== detailsTotal
        ) {
            const pdfUrl = await generateOrderPdf(id);
            const updatedOrder = await pool.query(
                `UPDATE orders
                 SET pdf_url = $1,
                     total_price = $2
                 WHERE id = $3
                 RETURNING *`,
                [pdfUrl, detailsTotal, id]
            );

            orderRow = {
                ...orderRow,
                ...updatedOrder.rows[0],
            };
        }

        res.json({
            order: orderRow,
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
