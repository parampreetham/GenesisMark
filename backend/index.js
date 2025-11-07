import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';

// --- Basic Setup ---
const app = express();
const PORT = process.env.PORT || 3001; // Port 3001 to avoid conflict with React's 3000

// --- Middleware ---
// Enable CORS for all routes
app.use(cors()); 
// Middleware to parse JSON bodies (though we're using multipart/form-data for files)
app.use(express.json());

// --- Multer Configuration (Phase 1: Simple Upload) ---
// We'll just save the file to a local 'uploads/' directory for now
// This is the first step of your processing pipeline.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // You can add a timestamp or unique prefix later if needed
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// --- API Endpoints ---

// Simple health check route
app.get('/api', (req, res) => {
  res.json({ message: 'GenesisMark API is running!' });
});

/**
 * @route   POST /api/upload
 * @desc    Uploads a file for processing
 * @access  Public
 * * This is the main entry point for your platform.
 * The 'upload.single('file')' middleware handles the file parsing.
 * The 'file' string must match the field name on the frontend form.
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
  // 'req.file' contains information about the uploaded file
  // 'req.body' will contain any other text fields from the form
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  console.log('File received:');
  console.log(req.file);

  // In future steps, this is where you will:
  // 1. Call ExifTool to scan metadata (req.file.path)
  // 2. Compute hashes (req.file.path)
  // 3. Embed watermark (req.file.path)
  // 4. Pin to IPFS
  // 5. Register on blockchain

  // For now (Phase 1), we just confirm reception.
  res.json({
    message: 'File uploaded successfully. Processing started.',
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size
  });
});

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`🚀 GenesisMark server listening on http://localhost:${PORT}`);
});