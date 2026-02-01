/**
 * OCR Service - Extract text from document images using Tesseract.js
 * Used to auto-fill document form fields (title, institution, date, number)
 */

import Tesseract from 'tesseract.js';
import path from 'path';

// Patterns for extracting document information (French/Arabic context)
const PATTERNS = {
    // Diploma/Certificate titles
    diplomaTitle: [
        /diplôme\s+(?:de\s+)?(.+?)(?:\n|$)/i,
        /certificat\s+(?:de\s+)?(.+?)(?:\n|$)/i,
        /attestation\s+(?:de\s+)?(.+?)(?:\n|$)/i,
        /licence\s+(?:en\s+)?(.+?)(?:\n|$)/i,
        /master\s+(?:en\s+)?(.+?)(?:\n|$)/i,
        /doctorat\s+(?:en\s+)?(.+?)(?:\n|$)/i,
        /baccalauréat/i,
    ],

    // Institution names
    institution: [
        /université\s+(.+?)(?:\n|$)/i,
        /faculté\s+(.+?)(?:\n|$)/i,
        /école\s+(.+?)(?:\n|$)/i,
        /institut\s+(.+?)(?:\n|$)/i,
        /centre\s+(.+?)(?:\n|$)/i,
        /etablissement\s+(.+?)(?:\n|$)/i,
    ],

    // Dates (various formats)
    date: [
        /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,  // DD/MM/YYYY
        /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,  // YYYY/MM/DD
        /(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i,
        /délivré\s+le\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /obtenu\s+le\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /date\s*:\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    ],

    // Document/Student numbers
    documentNumber: [
        /n[°o]\s*(?:étudiant|matricule|série)?\s*:?\s*([A-Z0-9\-\/]+)/i,
        /matricule\s*:?\s*([A-Z0-9\-\/]+)/i,
        /référence\s*:?\s*([A-Z0-9\-\/]+)/i,
        /cin\s*:?\s*([A-Z]{1,2}\d+)/i,
        /carte\s+nationale\s*:?\s*([A-Z]{1,2}\d+)/i,
    ],

    // Morocco-specific
    moroccanCities: [
        'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès',
        'Oujda', 'Kénitra', 'Tétouan', 'Salé', 'Nador', 'Mohammedia', 'El Jadida'
    ],

    moroccanUniversities: [
        'Mohammed V', 'Hassan II', 'Cadi Ayyad', 'Sidi Mohamed Ben Abdellah',
        'Abdelmalek Essaâdi', 'Ibn Zohr', 'Mohammed Premier', 'Al Akhawayn',
        'ENSA', 'ENCG', 'FSJES', 'FST'
    ]
};

/**
 * Extract text from an image file using Tesseract OCR
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromImage(imagePath) {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'fra+ara', // French + Arabic
            {
                logger: m => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`)
            }
        );
        return text;
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Failed to extract text from image');
    }
}

/**
 * Parse extracted text to find document fields
 * @param {string} text - Raw OCR text
 * @returns {Object} - Parsed fields
 */
export function parseDocumentText(text) {
    const result = {
        title: null,
        institution: null,
        issueDate: null,
        documentNumber: null,
        confidence: 0,
        rawText: text
    };

    let fieldsFound = 0;

    // Extract title
    for (const pattern of PATTERNS.diplomaTitle) {
        const match = text.match(pattern);
        if (match) {
            result.title = match[1] ? match[1].trim() : match[0].trim();
            fieldsFound++;
            break;
        }
    }

    // Extract institution
    for (const pattern of PATTERNS.institution) {
        const match = text.match(pattern);
        if (match) {
            result.institution = match[1] ? match[1].trim() : match[0].trim();
            fieldsFound++;
            break;
        }
    }

    // Check for Moroccan universities
    if (!result.institution) {
        for (const uni of PATTERNS.moroccanUniversities) {
            if (text.toLowerCase().includes(uni.toLowerCase())) {
                result.institution = uni;
                fieldsFound++;
                break;
            }
        }
    }

    // Extract date
    for (const pattern of PATTERNS.date) {
        const match = text.match(pattern);
        if (match) {
            result.issueDate = match[0].trim();
            fieldsFound++;
            break;
        }
    }

    // Extract document number
    for (const pattern of PATTERNS.documentNumber) {
        const match = text.match(pattern);
        if (match) {
            result.documentNumber = match[1] ? match[1].trim() : match[0].trim();
            fieldsFound++;
            break;
        }
    }

    // Calculate confidence based on fields found
    result.confidence = Math.round((fieldsFound / 4) * 100);

    return result;
}

/**
 * Process a document image and extract structured data
 * @param {string} filePath - Path to the document file
 * @returns {Promise<Object>} - Extracted document data
 */
export async function processDocument(filePath) {
    try {
        // Check file extension
        const ext = path.extname(filePath).toLowerCase();
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'];

        if (!imageExtensions.includes(ext) && ext !== '.pdf') {
            return {
                success: false,
                error: 'Unsupported file format. Use JPG, PNG, or PDF.',
                data: null
            };
        }

        // For PDF, we'd need to convert to image first (future enhancement)
        if (ext === '.pdf') {
            return {
                success: true,
                warning: 'PDF OCR requires image conversion. Fields may be incomplete.',
                data: {
                    title: null,
                    institution: null,
                    issueDate: null,
                    documentNumber: null,
                    confidence: 0
                }
            };
        }

        // Extract text from image
        const rawText = await extractTextFromImage(filePath);

        // Parse the extracted text
        const parsedData = parseDocumentText(rawText);

        return {
            success: true,
            data: parsedData
        };
    } catch (error) {
        console.error('Document processing error:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

export default {
    extractTextFromImage,
    parseDocumentText,
    processDocument
};
