const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const { getAdminPanel } = require("../controllers/adminController");

router.get(
    "/panel",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminPanel
);

module.exports = router;