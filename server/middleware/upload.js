import multer from "multer";
import path from "path";

// Set storage engine
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

// Allowed image formats
const ALLOWED_EXTENSIONS = /jpeg|jpg|png|webp|gif|svg/;
const ALLOWED_MIMETYPES = /image\/(jpeg|jpg|png|webp|gif|svg\+xml)/;

// Check File Type
function checkFileType(file, cb) {
    const extname = ALLOWED_EXTENSIONS.test(path.extname(file.originalname).toLowerCase());
    const mimetype = ALLOWED_MIMETYPES.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (JPG, PNG, WebP, GIF, SVG)"));
    }
}

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB Limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

export default upload;
