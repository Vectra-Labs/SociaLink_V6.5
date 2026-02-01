import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
    getMyDocuments,
    uploadDocument,
    deleteDocument,
    getAllDocuments,
    validateDocument,
    rejectDocument,
    getDocumentStats
} from '../controllers/establishmentDocumentController.js';

const router = express.Router();

// Configure multer for document uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'establishment-docs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `doc-${req.user.user_id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('PDF ou images uniquement'));
    }
});

// ============ ESTABLISHMENT ROUTES ============
router.get('/establishment/documents', authMiddleware, requireRole(['ESTABLISHMENT']), getMyDocuments);
router.post('/establishment/documents', authMiddleware, requireRole(['ESTABLISHMENT']), upload.single('file'), uploadDocument);
router.delete('/establishment/documents/:id', authMiddleware, requireRole(['ESTABLISHMENT']), deleteDocument);

// ============ ADMIN ROUTES ============
router.get('/admin/establishment-documents', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), getAllDocuments);
router.get('/admin/establishment-documents/stats', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), getDocumentStats);
router.put('/admin/establishment-documents/:id/validate', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), validateDocument);
router.put('/admin/establishment-documents/:id/reject', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), rejectDocument);

export default router;
