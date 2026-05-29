const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createOrder,
    getMyOrders,
    updateOrderStatus,
    getOrderDetails,
} = require("../controllers/orderController");

router.post(
    "/",
    authMiddleware,
    roleMiddleware("business"),
    createOrder
);

router.get(
    "/my",
    authMiddleware,
    getMyOrders
);

router.get(
    "/:id",
    authMiddleware,
    getOrderDetails
);

router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware("supplier", "business", "admin"),
    updateOrderStatus
);

module.exports = router;
