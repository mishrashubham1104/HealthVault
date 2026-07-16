import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer memory storage (we process the file buffer in-memory to encrypt before saving)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDFs, Word docs, and Images are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// AES encryption helper
const ENCRYPTION_KEY = Buffer.from(
  (process.env.ENCRYPTION_KEY || 'healthvaultsecretencryptionkey32c').slice(0, 32)
);
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a buffer and saves it to a file
 * @param {Buffer} buffer 
 * @param {string} filename 
 * @returns {string} Saved file path
 */
export const saveAndEncryptFile = (buffer, filename) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final()
  ]);
  
  // Save IV prepended to the encrypted data
  const finalBuffer = Buffer.concat([iv, encrypted]);
  const filePath = path.join(uploadDir, `${Date.now()}_${filename}`);
  fs.writeFileSync(filePath, finalBuffer);
  
  return filePath;
};

/**
 * Reads an encrypted file and decrypts it back to a buffer
 * @param {string} filePath 
 * @returns {Buffer} Decrypted file buffer
 */
export const readAndDecryptFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }
  
  const fileBuffer = fs.readFileSync(filePath);
  
  // Extract IV from the first 16 bytes
  const iv = fileBuffer.subarray(0, IV_LENGTH);
  const encryptedText = fileBuffer.subarray(IV_LENGTH);
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final()
  ]);
  
  return decrypted;
};
