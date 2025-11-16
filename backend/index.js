import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { execa } from 'execa';
import pinataSDK from '@pinata/sdk';
import { calculateSHA256, calculatePHash } from './src/hashUtils.js';

// --- ETHERS IMPORTS ---
import { ethers } from 'ethers';
import abi from './src/GenesisRegistry.json' with { type: 'json' };

import authRouter from './authRoutes.js';
import authMiddleware from './src/authMiddleware.js';

// --- Pinata Setup ---
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

// --- ETHERS CONTRACT SETUP ---
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const LOCALHOST_RPC_URL = "http://127.0.0.1:8545/";

const provider = new ethers.JsonRpcProvider(LOCALHOST_RPC_URL);
const signer = await provider.getSigner(0);
const genesisContract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
console.log(`✅ Connected to local blockchain. Contract loaded at ${CONTRACT_ADDRESS}`);

// --- Middleware ---
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors()); 
app.use(express.json());
app.use('/api/auth', authRouter);

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
app.post('/api/upload',authMiddleware, upload.single('file'), async (req, res) => {
  // ... (This route is complete and working)
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const originalFilename = req.file.originalname;
  
  try {
    const watermarkText = `GenesisMark - ${new Date().toISOString()}`;
    await execa('python', ['src/watermark.py', filePath, watermarkText]); 
    console.log(`Watermarking complete for ${originalFilename}`);
    
    const [sha256Hash, pHash] = await Promise.all([
      calculateSHA256(filePath),
      calculatePHash(filePath)
    ]);
    console.log(`Hashes complete: SHA-256: ${sha256Hash}, pHash: ${pHash}`);

    console.log('Pinning to IPFS...');
    const stream = fs.createReadStream(filePath);
    const options = {
      pinataMetadata: { name: originalFilename, keyvalues: { sha256: sha256Hash, pHash: pHash } },
    };
    const ipfsResult = await pinata.pinFileToIPFS(stream, options);
    const ipfsCid = ipfsResult.IpfsHash;
    console.log(`IPFS Pin complete! CID: ${ipfsCid}`);

    console.log("Registering record on blockchain...");
    const tx = await genesisContract.createRecord(sha256Hash, pHash, ipfsCid);
    const receipt = await tx.wait();
    console.log(`✅ Record created! Transaction hash: ${receipt.hash}`);
    console.log(`Upload request from user: ${req.user.email}`);

    res.json({
      message: 'File watermarked, processed, pinned to IPFS, and registered on-chain.',
      filename: originalFilename,
      sha256: sha256Hash,
      pHash: pHash,
      ipfsCid: ipfsCid,
      timestamp: ipfsResult.Timestamp
    });

  } catch (error) {
    console.error('Error processing file:', error.message);
    res.status(500).json({ error: 'Error processing file.' });
  } finally {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });
  }
});

// --- UPDATED VERIFICATION ENDPOINT ---
app.post('/api/verify',authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded for verification.' });
  }
  
  const filePath = req.file.path;
  
  try {
    // 1. Calculate the SHA-256 hash of the uploaded file
    const sha256Hash = await calculateSHA256(filePath);
    console.log(`Verification check for SHA-256: ${sha256Hash}`);

    // 2. Call the 'getRecord' function from our smart contract
    // This is a 'read' operation and doesn't cost any gas
    const record = await genesisContract.getRecord(sha256Hash);

    // 3. Check if the record exists
    // The 'creator' field will be a non-zero address if it exists
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const isAuthentic = record.creator !== zeroAddress;

    if (isAuthentic) {
      console.log("✅ VERIFIED: Record found on-chain.");
      console.log(`Verify request from user: ${req.user.email}`);
      res.json({
        message: 'File is authentic and verified on-chain.',
        isAuthentic: true,
        record: {
          sha256: record.sha256Hash,
          pHash: record.pHash,
          ipfsCid: record.ipfsCid,
          creator: record.creator,
          // Convert BigInt to string for JSON serialization
          timestamp: record.timestamp.toString(), 
        }
      });
    } else {
      console.log("❌ NOT VERIFIED: No record found for this hash.");
      res.json({
        message: 'File not found. This content has not been registered.',
        isAuthentic: false,
        sha256: sha256Hash,
      });
    }

  } catch (error) {
    console.error('Error processing verification file:', error);
    res.status(500).json({ error: 'Error processing verification file.' });
  } finally {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });
  }
});

// Simple health check route
app.get('/api', (req, res) => {
  res.json({ message: 'GenesisMark API is running!' });
});

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`🚀 GenesisMark server listening on http://localhost:${PORT}`);
});