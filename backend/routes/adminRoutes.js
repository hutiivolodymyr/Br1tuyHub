const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getAdminPanel,
    getAllUsers,
    deleteUser,
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

router.delete(
    "/users/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteUser
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