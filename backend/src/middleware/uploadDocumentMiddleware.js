import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads/documents");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create subdirectory per user
        const userId = req.user?.user_id || 'unknown';
        const userDir = path.join(uploadsDir, String(userId));

        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp_originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${uniqueSuffix}_${basename}${ext}`);
    }
});

// File filter - only allow specific document types
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé. Formats acceptés: PDF, JPG, PNG, WEBP'), false);
    }
};

// Export multer instance with 5MB limit
export const uploadDocument = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB max
    }
});

// Error handler middleware for multer errors
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Fichier trop volumineux. Taille maximum: 15MB'
            });
        }
        return res.status(400).json({ message: err.message });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};
