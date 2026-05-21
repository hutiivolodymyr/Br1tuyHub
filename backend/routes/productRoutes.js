const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("supplier", "admin"),
    upload.single("image"),
    createProduct
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("supplier", "admin"),
    updateProduct
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("supplier", "admin"),
    deleteProduct
);

module.exports = router;