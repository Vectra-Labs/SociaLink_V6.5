import { prisma } from "../config/db.js";
import path from "path";
import { createNotification } from "../services/notificationService.js";

// Import services (optional - graceful fallback if not installed)
let ocrService = null;
let encryptionService = null;

try {
    ocrService = await import("../services/ocrService.js");
} catch (e) {
    // OCR service not available - running without OCR
}

try {
    encryptionService = await import("../services/encryptionService.js");
} catch (e) {
    // Encryption service not available - running without encryption
}

// GET /api/worker/documents - Liste des documents
export const getDocuments = async (req, res) => {
    try {
        const workerId = req.user.user_id;

        const documents = await prisma.workerDocument.findMany({
            where: { worker_id: workerId },
            orderBy: { created_at: 'desc' }
        });

        res.json({
            status: 'success',
            data: documents
        });
    } catch (error) {
        console.error('GET DOCUMENTS ERROR:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des documents' });
    }
};

// POST /api/worker/documents - Upload un document avec OCR et chiffrement
export const uploadDocument = async (req, res) => {
    try {
        const workerId = req.user.user_id;
        let { type, name, institution, issue_date, expiry_date, document_number } = req.body;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: 'Le fichier est requis'
            });
        }

        if (!type || !name) {
            return res.status(400).json({
                message: 'Le type et le nom sont requis'
            });
        }

        // Validate document type
        const validTypes = ['DIPLOMA', 'CIN', 'CASIER_JUDICIAIRE', 'ATTESTATION_TRAVAIL', 'CARTE_CNSS', 'CERTIFICATE', 'OTHER'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: 'Type de document invalide' });
        }

        // === OCR Processing (optional) ===
        let ocrData = null;
        const filePath = req.file.path;
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'];

        if (ocrService && imageExts.includes(fileExt)) {
            try {
                const ocrResult = await ocrService.processDocument(filePath);

                if (ocrResult.success && ocrResult.data) {
                    ocrData = ocrResult.data;

                    // Auto-fill empty fields with OCR data
                    if (!institution && ocrData.institution) {
                        institution = ocrData.institution;
                    }
                    if (!issue_date && ocrData.issueDate) {
                        // Try to parse the OCR date
                        const parsed = new Date(ocrData.issueDate);
                        if (!isNaN(parsed.getTime())) {
                            issue_date = ocrData.issueDate;
                        }
                    }
                    if (!document_number && ocrData.documentNumber) {
                        document_number = ocrData.documentNumber;
                    }
                }
            } catch (ocrError) {
                console.error('[OCR] Error (non-blocking):', ocrError.message);
                // Continue without OCR data
            }
        }

        // === File Encryption (optional) ===
        let isEncrypted = false;
        if (encryptionService) {
            try {
                await encryptionService.encryptFileInPlace(filePath);
                isEncrypted = true;
            } catch (encError) {
                console.error('[Encryption] Error (non-blocking):', encError.message);
                // Continue without encryption
            }
        }

        // Generate accessible URL
        const file_url = `/uploads/documents/${workerId}/${req.file.filename}`;

        // Create document record
        const document = await prisma.workerDocument.create({
            data: {
                worker_id: workerId,
                type,
                name,
                institution: institution || null,
                issue_date: issue_date ? new Date(issue_date) : null,
                expiry_date: expiry_date ? new Date(expiry_date) : null,
                document_number: document_number || null,
                file_url,
                status: 'PENDING' // En attente de validation admin
            }
        });

        // === Notify all Admins ===
        try {
            const admins = await prisma.user.findMany({
                where: {
                    role: { in: ['ADMIN', 'SUPER_ADMIN'] },
                    isEmailVerified: true
                },
                select: { user_id: true }
            });

            const worker = await prisma.workerProfile.findUnique({
                where: { user_id: workerId },
                select: { first_name: true, last_name: true }
            });

            const workerName = worker
                ? `${worker.first_name || ''} ${worker.last_name || ''}`.trim() || 'Un travailleur'
                : 'Un travailleur';

            // Create notifications for all admins
            if (admins.length > 0) {
                // Use Promise.all to send parallel notifications via service (DB + Socket)
                await Promise.all(admins.map(admin => createNotification({
                    userId: admin.user_id,
                    type: 'INFO',
                    message: `${workerName} a uploadé un nouveau document (${type}) à vérifier.`,
                    link: '/admin/documents'
                })));
            }
        } catch (notifError) {
            console.error('[Notifications] Error (non-blocking):', notifError.message);
        }

        res.status(201).json({
            status: 'success',
            data: document,
            ocrData: ocrData, // Return OCR data for frontend confirmation
            isEncrypted,
            message: 'Document uploadé avec succès. En attente de validation par un administrateur.'
        });
    } catch (error) {
        console.error('UPLOAD DOCUMENT ERROR:', error);
        res.status(500).json({ message: "Erreur lors de l'upload du document" });
    }
};



// PUT /api/worker/documents/:id - Modifier un document (avant validation)
export const updateDocument = async (req, res) => {
    try {
        const workerId = req.user.user_id;
        const documentId = parseInt(req.params.id);
        const { name, institution, issue_date, expiry_date, document_number } = req.body;

        // Check ownership and status
        const existing = await prisma.workerDocument.findUnique({
            where: { document_id: documentId }
        });

        if (!existing || existing.worker_id !== workerId) {
            return res.status(404).json({ message: 'Document non trouvé' });
        }

        // Only allow updates if not yet verified
        if (existing.status === 'VERIFIED') {
            return res.status(403).json({
                message: 'Impossible de modifier un document déjà validé'
            });
        }

        const document = await prisma.workerDocument.update({
            where: { document_id: documentId },
            data: {
                name: name || existing.name,
                institution: institution !== undefined ? institution : existing.institution,
                issue_date: issue_date ? new Date(issue_date) : existing.issue_date,
                expiry_date: expiry_date ? new Date(expiry_date) : existing.expiry_date,
                document_number: document_number !== undefined ? document_number : existing.document_number,
                status: 'PENDING' // Reset to pending on update
            }
        });

        res.json({
            status: 'success',
            data: document,
            message: 'Document modifié avec succès'
        });
    } catch (error) {
        console.error('UPDATE DOCUMENT ERROR:', error);
        res.status(500).json({ message: 'Erreur lors de la modification du document' });
    }
};

// DELETE /api/worker/documents/:id - Supprimer un document
export const deleteDocument = async (req, res) => {
    try {
        const workerId = req.user.user_id;
        const documentId = parseInt(req.params.id);

        // Check ownership
        const existing = await prisma.workerDocument.findUnique({
            where: { document_id: documentId }
        });

        if (!existing || existing.worker_id !== workerId) {
            return res.status(404).json({ message: 'Document non trouvé' });
        }

        await prisma.workerDocument.delete({
            where: { document_id: documentId }
        });

        res.json({
            status: 'success',
            message: 'Document supprimé avec succès'
        });
    } catch (error) {
        console.error('DELETE DOCUMENT ERROR:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du document' });
    }
};

// =============================================
// ADMIN ROUTES
// =============================================

// GET /api/admin/documents/pending - Documents en attente de validation
export const getPendingDocuments = async (req, res) => {
    try {
        const documents = await prisma.workerDocument.findMany({
            where: { status: 'PENDING' },
            include: {
                worker: {
                    select: {
                        first_name: true,
                        last_name: true,
                        user: { select: { email: true } }
                    }
                }
            },
            orderBy: { created_at: 'asc' }
        });

        res.json({
            status: 'success',
            data: documents,
            total: documents.length
        });
    } catch (error) {
        console.error('GET PENDING DOCUMENTS ERROR:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des documents' });
    }
};

// PUT /api/admin/documents/:id/verify - Valider un document
export const verifyDocument = async (req, res) => {
    try {
        const adminId = req.user.user_id;
        const documentId = parseInt(req.params.id);

        const document = await prisma.workerDocument.update({
            where: { document_id: documentId },
            data: {
                status: 'VERIFIED',
                verified_by: adminId,
                verified_at: new Date(),
                rejection_reason: null
            }
        });

        // Create notification for worker
        await createNotification({
            userId: document.worker_id,
            type: 'SUCCESS',
            message: `Votre document "${document.name}" a été validé par un administrateur.`,
            link: '/worker/documents'
        });

        res.json({
            status: 'success',
            data: document,
            message: 'Document validé avec succès'
        });
    } catch (error) {
        console.error('VERIFY DOCUMENT ERROR:', error);
        res.status(500).json({ message: 'Erreur lors de la validation du document' });
    }
};

// PUT /api/admin/documents/:id/reject - Rejeter un document
export const rejectDocument = async (req, res) => {
    try {
        const adminId = req.user.user_id;
        const documentId = parseInt(req.params.id);
        const { reason } = req.body;

        const document = await prisma.workerDocument.update({
            where: { document_id: documentId },
            data: {
                status: 'REJECTED',
                verified_by: adminId,
                verified_at: new Date(),
                rejection_reason: reason || 'Document non conforme'
            }
        });

        // Create notification for worker
        await createNotification({
            userId: document.worker_id,
            type: 'WARNING',
            message: `Votre document "${document.name}" a été rejeté. Raison: ${reason || 'Document non conforme'}`,
            link: '/worker/documents'
        });

        res.json({
            status: 'success',
            data: document,
            message: 'Document rejeté'
        });
    } catch (error) {
        console.error('REJECT DOCUMENT ERROR:', error);
        res.status(500).json({ message: 'Erreur lors du rejet du document' });
    }
};
