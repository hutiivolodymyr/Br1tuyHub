const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + ext;

        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;

    const extName = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: Number(process.env.MAX_UPLOAD_SIZE) || 5 * 1024 * 1024,
    },
});

module.exports = upload;
