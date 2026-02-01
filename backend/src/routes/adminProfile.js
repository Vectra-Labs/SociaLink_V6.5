import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';
import {
    getMyProfile,
    updateMyProfile,
    updateProfilePhoto,
    getAdminProfile,
    updateAdminPhotoBySuper
} from '../controllers/adminProfileController.js';

const router = express.Router();

// Configure multer for admin photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'admin-photos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const targetId = req.params.id || req.user.user_id;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `admin-${targetId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Images uniquement (jpeg, jpg, png, webp)'));
    }
});

// Admin routes (self)
router.get('/profile', authMiddleware, requireRole(['ADMIN', 'SUPER_ADMIN']), getMyProfile);
router.put('/profile', authMiddleware, requireRole(['ADMIN', 'SUPER_ADMIN']), updateMyProfile);
router.put('/profile/photo', authMiddleware, requireRole(['ADMIN', 'SUPER_ADMIN']), upload.single('photo'), updateProfilePhoto);

// Super admin routes to manage other admin profiles
router.get('/admins/:id/profile', authMiddleware, requireRole(['SUPER_ADMIN']), getAdminProfile);
router.put('/profile/:id/photo', authMiddleware, requireRole(['SUPER_ADMIN']), upload.single('photo'), updateAdminPhotoBySuper);

export default router;

