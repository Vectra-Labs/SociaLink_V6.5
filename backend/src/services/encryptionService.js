/**
 * Encryption Service - AES-256-CBC encryption for document files
 * Encrypts uploaded documents before storage for security compliance
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// Use environment variable or generate a secure key
const ENCRYPTION_KEY = process.env.DOCUMENT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypt a buffer using AES-256-CBC
 * @param {Buffer} buffer - Data to encrypt
 * @returns {Object} - { encrypted: Buffer, iv: string }
 */
export function encryptBuffer(buffer) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8');

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    return {
        encrypted,
        iv: iv.toString('hex')
    };
}

/**
 * Decrypt a buffer using AES-256-CBC
 * @param {Buffer} encryptedBuffer - Encrypted data
 * @param {string} ivHex - Initialization vector as hex string
 * @returns {Buffer} - Decrypted data
 */
export function decryptBuffer(encryptedBuffer, ivHex) {
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

    return decrypted;
}

/**
 * Encrypt a file and save it with .enc extension
 * @param {string} inputPath - Path to original file
 * @param {string} outputPath - Path for encrypted file (optional, defaults to inputPath + .enc)
 * @returns {Promise<Object>} - { encryptedPath: string, iv: string, originalName: string }
 */
export async function encryptFile(inputPath, outputPath = null) {
    try {
        const buffer = await fs.readFile(inputPath);
        const { encrypted, iv } = encryptBuffer(buffer);

        const encryptedPath = outputPath || `${inputPath}.enc`;
        await fs.writeFile(encryptedPath, encrypted);

        // Store IV in a sidecar file or include in metadata
        const ivPath = `${encryptedPath}.iv`;
        await fs.writeFile(ivPath, iv);

        return {
            encryptedPath,
            iv,
            originalName: path.basename(inputPath),
            originalSize: buffer.length,
            encryptedSize: encrypted.length
        };
    } catch (error) {
        console.error('File encryption error:', error);
        throw new Error('Failed to encrypt file');
    }
}

/**
 * Decrypt a file and return the buffer
 * @param {string} encryptedPath - Path to encrypted file
 * @param {string} iv - Initialization vector (if not using sidecar file)
 * @returns {Promise<Buffer>} - Decrypted file buffer
 */
export async function decryptFile(encryptedPath, iv = null) {
    try {
        const encryptedBuffer = await fs.readFile(encryptedPath);

        // Try to read IV from sidecar file if not provided
        let ivHex = iv;
        if (!ivHex) {
            const ivPath = `${encryptedPath}.iv`;
            try {
                ivHex = await fs.readFile(ivPath, 'utf8');
            } catch (e) {
                throw new Error('IV not found. Cannot decrypt file.');
            }
        }

        return decryptBuffer(encryptedBuffer, ivHex);
    } catch (error) {
        console.error('File decryption error:', error);
        throw new Error('Failed to decrypt file');
    }
}

/**
 * Encrypt a file in-place (replace original with encrypted version)
 * Stores metadata in a JSON sidecar file
 * @param {string} filePath - Path to file
 * @returns {Promise<Object>} - Encryption metadata
 */
export async function encryptFileInPlace(filePath) {
    try {
        const buffer = await fs.readFile(filePath);
        const { encrypted, iv } = encryptBuffer(buffer);

        // Get file info before overwriting
        const originalName = path.basename(filePath);
        const originalExt = path.extname(filePath);
        const originalSize = buffer.length;

        // Write encrypted content back
        await fs.writeFile(filePath, encrypted);

        // Store metadata in sidecar JSON
        const metadata = {
            iv,
            originalName,
            originalExt,
            originalSize,
            encryptedAt: new Date().toISOString(),
            algorithm: ALGORITHM
        };

        await fs.writeFile(`${filePath}.meta`, JSON.stringify(metadata, null, 2));

        return metadata;
    } catch (error) {
        console.error('In-place encryption error:', error);
        throw new Error('Failed to encrypt file in place');
    }
}

/**
 * Decrypt a file that was encrypted in-place
 * @param {string} filePath - Path to encrypted file
 * @returns {Promise<Buffer>} - Decrypted content
 */
export async function decryptFileInPlace(filePath) {
    try {
        // Read metadata
        const metadataPath = `${filePath}.meta`;
        const metadataRaw = await fs.readFile(metadataPath, 'utf8');
        const metadata = JSON.parse(metadataRaw);

        // Decrypt
        const encryptedBuffer = await fs.readFile(filePath);
        return decryptBuffer(encryptedBuffer, metadata.iv);
    } catch (error) {
        console.error('In-place decryption error:', error);
        throw new Error('Failed to decrypt file');
    }
}

/**
 * Check if a file is encrypted (has metadata sidecar)
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>}
 */
export async function isFileEncrypted(filePath) {
    try {
        await fs.access(`${filePath}.meta`);
        return true;
    } catch {
        return false;
    }
}

export default {
    encryptBuffer,
    decryptBuffer,
    encryptFile,
    decryptFile,
    encryptFileInPlace,
    decryptFileInPlace,
    isFileEncrypted
};
