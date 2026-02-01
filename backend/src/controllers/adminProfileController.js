import { prisma } from '../config/db.js';
import path from 'path';
import fs from 'fs';

// GET /api/admin/profile
export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        let profile = await prisma.adminProfile.findUnique({
            where: { user_id: userId }
        });

        if (!profile) {
            // Return empty profile structure if not created yet
            profile = {
                user_id: userId,
                first_name: '',
                last_name: '',
                phone: '',
                profile_pic_url: null,
                department: ''
            };
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// PUT /api/admin/profile
export const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { first_name, last_name, phone, department } = req.body;

        const profile = await prisma.adminProfile.upsert({
            where: { user_id: userId },
            update: {
                first_name,
                last_name,
                phone,
                department
            },
            create: {
                user_id: userId,
                first_name,
                last_name,
                phone,
                department
            }
        });

        res.json(profile);
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// PUT /api/admin/profile/photo
export const updateProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.user_id;

        if (!req.file) {
            return res.status(400).json({ message: 'Aucune image fournie' });
        }

        const photoUrl = `/uploads/admin-photos/${req.file.filename}`;

        const profile = await prisma.adminProfile.upsert({
            where: { user_id: userId },
            update: { profile_pic_url: photoUrl },
            create: {
                user_id: userId,
                first_name: 'Admin',
                last_name: '',
                profile_pic_url: photoUrl
            }
        });

        res.json({ profile_pic_url: photoUrl, profile });
    } catch (error) {
        console.error('Error updating admin photo:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// GET /api/super-admin/admins/:id/profile (for super admin to view admin profiles)
export const getAdminProfile = async (req, res) => {
    try {
        const adminId = parseInt(req.params.id);

        const profile = await prisma.adminProfile.findUnique({
            where: { user_id: adminId },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                        status: true,
                        admin_permissions: true,
                        created_at: true
                    }
                }
            }
        });

        if (!profile) {
            return res.status(404).json({ message: 'Profil non trouvé' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// PUT /api/admin/profile/:id/photo (for super admin to update any admin's photo)
export const updateAdminPhotoBySuper = async (req, res) => {
    try {
        const adminId = parseInt(req.params.id);

        if (!req.file) {
            return res.status(400).json({ message: 'Aucune image fournie' });
        }

        const photoUrl = `/uploads/admin-photos/${req.file.filename}`;

        const profile = await prisma.adminProfile.upsert({
            where: { user_id: adminId },
            update: { profile_pic_url: photoUrl },
            create: {
                user_id: adminId,
                first_name: '',
                last_name: '',
                profile_pic_url: photoUrl
            }
        });

        res.json({ profile_pic_url: photoUrl, profile });
    } catch (error) {
        console.error('Error updating admin photo by super:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
