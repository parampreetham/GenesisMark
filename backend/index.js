import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; // <-- Add this import
import { calculateSHA256, calculatePHash } from './src/hashUtils.js'; // <-- Add this import
import { execa } from 'execa';
import 'dotenv/config'; // Loads .env file immediately
import pinataSDK from '@pinata/sdk';

// --- Basic Setup ---
const app = express();
const PORT = process.env.PORT || 3001;
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

// --- Middleware ---
app.use(cors()); 
app.use(express.json());

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// --- API Endpoints ---

app.get('/api', (req, res) => {
  res.json({ message: 'GenesisMark API is running!' });
});

/**
 * @route   POST /api/upload
 * @desc    Uploads a file, WATERMARKS it, generates hashes, and (later) registers it
 * @access  Public
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const originalFilename = req.file.originalname;
  
  try {
    // --- Phase 3: Watermarking ---
    const watermarkText = `GenesisMark - ${new Date().toISOString()}`;
    try {
      await execa('python', ['src/watermark.py', filePath, watermarkText]); 
      console.log(`Watermarking complete for ${originalFilename}`);
    } catch (pyError) {
      console.error("Python script error:", pyError.stderr || pyError.message);
      throw new Error('Failed to apply watermark.');
    }
    
    // --- Phase 2: Hashing (on watermarked file) ---
    const [sha256Hash, pHash] = await Promise.all([
      calculateSHA256(filePath),
      calculatePHash(filePath)
    ]);
    console.log(`Hashes complete: SHA-256: ${sha256Hash}, pHash: ${pHash}`);

    // --- 3. NEW: Phase 4: Pin to IPFS ---
    console.log('Pinning to IPFS...');
    const stream = fs.createReadStream(filePath);
    const options = {
      pinataMetadata: {
        name: originalFilename,
        keyvalues: {
          sha256: sha256Hash,
          pHash: pHash
        }
      },
    };
    const ipfsResult = await pinata.pinFileToIPFS(stream, options);
    const ipfsCid = ipfsResult.IpfsHash;
    console.log(`IPFS Pin complete! CID: ${ipfsCid}`);

    // --- Phase 5 (TODO: Save to DB/Blockchain) ---
    // Now you have all the data: sha256Hash, pHash, and ipfsCid

    // Send back the results
    res.json({
      message: 'File watermarked, processed, and pinned to IPFS.',
      filename: originalFilename,
      sha256: sha256Hash,
      pHash: pHash,
      ipfsCid: ipfsCid, // <-- NEW DATA
      timestamp: ipfsResult.Timestamp
    });

  } catch (error) {
    console.error('Error processing file:', error.message);
    res.status(500).json({ error: 'Error processing file.' });
  } finally {
    // 4. Clean up: Delete the temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });
  }
});

/**
 * @route   POST /api/verify
 * @desc    Uploads a file and generates its hashes for verification
 * @access  Public
 */
app.post('/api/verify', upload.single('file'), async (req, res) => { // <-- Make this async
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded for verification.' });
  }

  const filePath = req.file.path;

  try {
    // 1. Generate both hashes in parallel
    const [sha256Hash, pHash] = await Promise.all([
      calculateSHA256(filePath),
      calculatePHash(filePath)
    ]);

    console.log(`File for verification received: ${req.file.filename}`);
    console.log(`SHA-256: ${sha256Hash}`);
    console.log(`pHash: ${pHash}`);

    // In future steps, you will use these hashes to:
    // 1. Check DB for SHA-256 match (exact file)
    // 2. Check DB for pHash match (similar file)

    res.json({
      message: 'Verification check complete.',
      sha256: sha256Hash,
      pHash: pHash,
      isAuthentic: 'not_implemented', // We'll build this in a later phase
      isSimilar: 'not_implemented'
    });

  } catch (error) {
    console.error('Error processing verification file:', error);
    res.status(500).json({ error: 'Error processing verification file.' });
  } finally {
    // 2. Clean up: Delete the temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });
  }
});


// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`🚀 GenesisMark server listening on http://localhost:${PORT}`);
});