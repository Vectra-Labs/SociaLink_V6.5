import { prisma } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import encryptionService from "../services/encryptionService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//----------------------------- Téléchargement de Diplôme (Upload) -----------------------------//
/**
 * Télécharge un diplôme (PDF), le chiffre et l'enregistre.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const uploadDiploma = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!req.file) {
      return res.status(400).json({
        message: "PDF file is required",
      });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, "../../uploads/diplomas");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate filename
    const fileName = `worker_${userId}_diploma_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    // Save initial file
    fs.writeFileSync(filePath, req.file.buffer);

    // Encrypt in-place (creates .meta file for IV)
    await encryptionService.encryptFileInPlace(filePath);

    // Chemin relatif pour stockage DB
    // Stockage du chemin relatif depuis la racine des uploads pour cohérence
    const relativePath = `/uploads/diplomas/${fileName}`;

    // Sauvegarde en base de données
    const diploma = await prisma.diploma.create({
      data: {
        user_id: userId,
        name: req.body.name,
        institution: req.body.institution,
        file_path: relativePath, // Storing the path to be used by download endpoint
        description: req.body.description,
        verification_status: "PENDING",
      },
    });

    // ... (previous code)
    res.status(201).json({
      message: "Diploma uploaded successfully",
      data: diploma,
    });
  } catch (error) {
    console.error("UPLOAD DIPLOMA ERROR:", error);
    res.status(500).json({
      message: "Failed to upload diploma",
    });
  }
};

//----------------------------- Téléchargement de Diplôme (Download) -----------------------------//
/**
 * Récupère un diplôme, le déchiffre si nécessaire et l'envoie au client.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const downloadDiploma = async (req, res) => {
  try {
    const diplomaId = parseInt(req.params.id);
    const userId = req.user.user_id;
    const userRole = req.user.role;

    const diploma = await prisma.diploma.findUnique({
      where: { diploma_id: diplomaId },
    });

    if (!diploma) {
      return res.status(404).json({ message: "Diploma not found" });
    }

    // Access Control: Owner or Admin
    if (diploma.user_id !== userId && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }

    // Construct duplicate absolute path check (security)
    // The DB stores relative path like "/uploads/diplomas/..."
    // We need absolute path for fs
    const relativePath = diploma.file_path;
    const absolutePath = path.join(__dirname, "../../", relativePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Check if encrypted
    const isEncrypted = await encryptionService.isFileEncrypted(absolutePath);
    
    let fileBuffer;
    if (isEncrypted) {
      fileBuffer = await encryptionService.decryptFileInPlace(absolutePath);
    } else {
      fileBuffer = fs.readFileSync(absolutePath);
    }

    // Determine content type (assume PDF for diplomas as per requirement, or detect)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${diploma.name}.pdf"`);
    res.send(fileBuffer);

  } catch (error) {
    console.error("DOWNLOAD DIPLOMA ERROR:", error);
    res.status(500).json({ message: "Failed to download diploma" });
  }
};
