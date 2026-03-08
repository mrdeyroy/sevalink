import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Resolve directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads folder path
const uploadsDir = path.join(__dirname, "../../uploads");

// create uploads folder if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

// Allowed formats
const ALLOWED_EXTENSIONS = /jpeg|jpg|png|webp|gif|svg/;
const ALLOWED_MIMETYPES = /image\/(jpeg|jpg|png|webp|gif|svg\+xml)/;

function checkFileType(file, cb) {
    const extname = ALLOWED_EXTENSIONS.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = ALLOWED_MIMETYPES.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (JPG, PNG, WebP, GIF, SVG)"));
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 10000000 }, // 10MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

export default upload;