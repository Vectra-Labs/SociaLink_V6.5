import { prisma } from '../config/db.js';
import { createNotification } from "../services/notificationService.js";
import path from 'path';
import fs from 'fs';

// GET /api/establishment/documents
export const getMyDocuments = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const documents = await prisma.establishmentDocument.findMany({
            where: { user_id: userId },
            orderBy: { uploaded_at: 'desc' }
        });

        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// POST /api/establishment/documents
export const uploadDocument = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { type } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier fourni' });
        }

        if (!type) {
            return res.status(400).json({ message: 'Type de document requis' });
        }

        const validTypes = ['ICE', 'RC', 'CNSS', 'PATENT', 'RIB', 'OTHER'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: 'Type de document invalide' });
        }

        const fileUrl = `/uploads/establishment-docs/${req.file.filename}`;

        const document = await prisma.establishmentDocument.create({
            data: {
                user_id: userId,
                type,
                file_url: fileUrl,
                file_name: req.file.originalname,
                status: 'PENDING'
            }
        });

        res.status(201).json(document);

        // Notify Admins
        try {
            const admins = await prisma.user.findMany({
                where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
                select: { user_id: true }
            });

            // Get establishment name
            const establishment = await prisma.establishmentProfile.findUnique({
                where: { user_id: userId },
                select: { name: true }
            });
            const establishmentName = establishment?.name || 'Un établissement';

            if (admins.length > 0) {
                await Promise.all(admins.map(admin => createNotification({
                    userId: admin.user_id,
                    type: 'INFO',
                    message: `${establishmentName} a uploadé un nouveau document (${type}) à vérifier.`,
                    link: `/admin/verification/establishments/${userId}`
                })));
            }
        } catch (notifError) {
            console.error('NOTIFICATION ERROR:', notifError);
        }
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// DELETE /api/establishment/documents/:id
export const deleteDocument = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const documentId = parseInt(req.params.id);

        const document = await prisma.establishmentDocument.findFirst({
            where: { document_id: documentId, user_id: userId }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document non trouvé' });
        }

        // Only allow deletion of pending documents
        if (document.status !== 'PENDING') {
            return res.status(400).json({ message: 'Impossible de supprimer un document déjà traité' });
        }

        await prisma.establishmentDocument.delete({
            where: { document_id: documentId }
        });

        res.json({ message: 'Document supprimé' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// ============ ADMIN ROUTES ============

// GET /api/admin/establishment-documents
export const getAllDocuments = async (req, res) => {
    try {
        const { status } = req.query;

        const where = {};
        if (status && ['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
            where.status = status;
        }

        const documents = await prisma.establishmentDocument.findMany({
            where,
            include: {
                establishment: {
                    select: {
                        name: true,
                        ice_number: true,
                        logo_url: true,
                        contact_first_name: true,
                        contact_last_name: true
                    }
                }
            },
            orderBy: { uploaded_at: 'desc' }
        });

        res.json(documents);
    } catch (error) {
        console.error('Error fetching all documents:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// PUT /api/admin/establishment-documents/:id/validate
export const validateDocument = async (req, res) => {
    try {
        const documentId = parseInt(req.params.id);
        const adminId = req.user.user_id;

        const document = await prisma.establishmentDocument.update({
            where: { document_id: documentId },
            data: {
                status: 'VERIFIED',
                reviewed_by: adminId,
                reviewed_at: new Date()
            }
        });

        // Log the action
        await prisma.adminLog.create({
            data: {
                admin_id: adminId,
                action: 'VALIDATE_ESTABLISHMENT_DOC',
                target_type: 'EstablishmentDocument',
                target_id: documentId,
                details: { type: document.type }
            }
        });

        res.json(document);
    } catch (error) {
        console.error('Error validating document:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// PUT /api/admin/establishment-documents/:id/reject
export const rejectDocument = async (req, res) => {
    try {
        const documentId = parseInt(req.params.id);
        const adminId = req.user.user_id;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: 'Raison du rejet requise' });
        }

        const document = await prisma.establishmentDocument.update({
            where: { document_id: documentId },
            data: {
                status: 'REJECTED',
                reviewed_by: adminId,
                reviewed_at: new Date(),
                rejection_reason: reason
            }
        });

        // Log the action
        await prisma.adminLog.create({
            data: {
                admin_id: adminId,
                action: 'REJECT_ESTABLISHMENT_DOC',
                target_type: 'EstablishmentDocument',
                target_id: documentId,
                details: { type: document.type, reason }
            }
        });

        res.json(document);
    } catch (error) {
        console.error('Error rejecting document:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// GET /api/admin/establishment-documents/stats
export const getDocumentStats = async (req, res) => {
    try {
        const [pending, verified, rejected, total] = await Promise.all([
            prisma.establishmentDocument.count({ where: { status: 'PENDING' } }),
            prisma.establishmentDocument.count({ where: { status: 'VERIFIED' } }),
            prisma.establishmentDocument.count({ where: { status: 'REJECTED' } }),
            prisma.establishmentDocument.count()
        ]);

        res.json({ pending, verified, rejected, total });
    } catch (error) {
        console.error('Error fetching document stats:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
