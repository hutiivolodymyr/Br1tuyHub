const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getAdminPanel,
    getAllUsers,
    getAllOrders,
    getAllProducts,
    getAuditLogs,
    deleteUser,
    deleteOrder,
    blockUser,
    unblockUser,
} = require("../controllers/adminController");

router.get(
    "/panel",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminPanel
);

router.get(
    "/users",
    authMiddleware,
    roleMiddleware("admin"),
    getAllUsers
);

router.get(
    "/orders",
    authMiddleware,
    roleMiddleware("admin"),
    getAllOrders
);

router.get(
    "/products",
    authMiddleware,
    roleMiddleware("admin"),
    getAllProducts
);

router.get(
    "/audit-logs",
    authMiddleware,
    roleMiddleware("admin"),
    getAuditLogs
);

router.delete(
    "/users/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteUser
);

router.delete(
    "/orders/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteOrder
);

router.put(
    "/users/:id/block",
    authMiddleware,
    roleMiddleware("admin"),
    blockUser
);

router.put(
    "/users/:id/unblock",
    authMiddleware,
    roleMiddleware("admin"),
    unblockUser
);

module.exports = router;
