import { prisma } from "../config/db.js";

//----------------------------- Get Worker Languages -----------------------------//
export const getLanguages = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const languages = await prisma.workerLanguage.findMany({
            where: { worker_id: userId },
            orderBy: { id: 'asc' }
        });

        res.status(200).json({
            success: true,
            data: languages,
        });
    } catch (error) {
        console.error("GET LANGUAGES ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch languages",
        });
    }
};

//----------------------------- Add Worker Language -----------------------------//
export const addLanguage = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { name, level, code } = req.body;

        if (!name || !level) {
            return res.status(400).json({
                success: false,
                message: "Name and level are required",
            });
        }

        const newLanguage = await prisma.workerLanguage.create({
            data: {
                worker_id: userId,
                name,
                level,
                code: code || null, // Optional
            },
        });

        res.status(201).json({
            success: true,
            data: newLanguage,
        });
    } catch (error) {
        console.error("ADD LANGUAGE ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add language",
        });
    }
};

//----------------------------- Update Worker Language -----------------------------//
export const updateLanguage = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { id } = req.params;
        const { name, level, code } = req.body;

        // Verify ownership
        const existingLanguage = await prisma.workerLanguage.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingLanguage) {
            return res.status(404).json({
                success: false,
                message: "Language not found",
            });
        }

        if (existingLanguage.worker_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const updatedLanguage = await prisma.workerLanguage.update({
            where: { id: parseInt(id) },
            data: {
                name,
                level,
                code,
            },
        });

        res.status(200).json({
            success: true,
            data: updatedLanguage,
        });
    } catch (error) {
        console.error("UPDATE LANGUAGE ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update language",
        });
    }
};

//----------------------------- Delete Worker Language -----------------------------//
export const deleteLanguage = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { id } = req.params;

        // Verify ownership
        const existingLanguage = await prisma.workerLanguage.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingLanguage) {
            return res.status(404).json({
                success: false,
                message: "Language not found",
            });
        }

        if (existingLanguage.worker_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await prisma.workerLanguage.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({
            success: true,
            message: "Language deleted successfully",
        });
    } catch (error) {
        console.error("DELETE LANGUAGE ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete language",
        });
    }
};
