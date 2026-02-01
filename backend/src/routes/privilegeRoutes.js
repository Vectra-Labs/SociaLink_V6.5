/**
 * Privilege Routes
 * API routes for privilege management
 */

import express from 'express';
import {
    getAllPrivileges,
    getPrivilege,
    updatePrivileges,
    updatePrivilege,
    invalidateCache,
    getWorkerAccess
} from '../controllers/privilegeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ============ PUBLIC ROUTES ============
// Get current user's access level (requires auth)
router.get('/worker-access', authMiddleware, getWorkerAccess);

// ============ SUPER ADMIN ONLY ============
// Get all privileges
router.get('/', authMiddleware, roleMiddleware('SUPER_ADMIN'), getAllPrivileges);

// Get single privilege
router.get('/:key', authMiddleware, roleMiddleware('SUPER_ADMIN'), getPrivilege);

// Bulk update privileges
router.put('/', authMiddleware, roleMiddleware('SUPER_ADMIN'), updatePrivileges);

// Update single privilege
router.put('/:key', authMiddleware, roleMiddleware('SUPER_ADMIN'), updatePrivilege);

// Force cache invalidation
router.post('/invalidate-cache', authMiddleware, roleMiddleware('SUPER_ADMIN'), invalidateCache);

export default router;
